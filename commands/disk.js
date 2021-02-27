module.exports = {
  command: 'disk',
  desc: 'test disk speed (writes, reads)',
  builder,
  handler
}

function builder (yarg) {
  yarg
    .option('block-count', {
      type: 'number',
      desc: 'the number of blocks to write then read',
      default: 10000,
      alias: ['bc']
    })
    .option('block-size', {
      type: 'number',
      desc: 'the size of blocks to write',
      default: 1024 * 1024,
      alias: ['bs']
    })
    .option('file', {
      type: 'string',
      desc: 'the test file where data should be written',
      default: 'speed-test.dat',
      alias: ['f']
    })
    .option('overwrite', {
      type: 'boolean',
      desc: 'overwrite the file if it exists'
    })
    .option('time-limit', {
      type: 'number',
      desc: 'limit to a write duration of this many floating-point seconds',
      alias: ['tl']
    })
    .option('write-only', {
      type: 'boolean',
      desc: 'just write; do not perform the subsequent read stage',
      alias: ['wo']
    })
}

async function handler ({
  blockCount,
  blockSize,
  file,
  overwrite,
  timeLimit,
  writeOnly
}) {
  require('log-a-log')()

  const c = require('@buzuli/color')
  const fs = require('fs')
  const bytes = require('bytes')
  const meter = require('@buzuli/meter')
  const throttle = require('@buzuli/throttle')
  const durations = require('durations')

  const { promises: pfs } = fs

  const buffer = Buffer.alloc(blockSize)
  const writeWatch = durations.stopwatch()
  const readWatch = durations.stopwatch()

  const metrics = meter()

  if (!overwrite) {
    try {
      await pfs.stat(file)
      console.error('File exists. Bailing.')
      process.exit(1)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Could not stat file:', error)
        process.exit(1)
      }
    }
  }

  let writesRemaining = blockCount

  console.log('Opening file...')

  const fh = await pfs.open(file, 'w+')

  const notify = throttle({
    minDelay: 1000,
    maxDelay: 1000,
    reportFunc: () => {
      const writeBytes = metrics.get('write.bytes.last')
      const readBytes = metrics.get('read.bytes.last')
      console.info(`Write=${c.orange(bytes(writeBytes))}/${'s'}   Read=${c.orange(bytes(readBytes))}/${'s'}`)

      // Clear per-second stats
      metrics.set('write.bytes.last')
      metrics.set('read.bytes.last')
    }
  })

  const reachedTimeLimit = () => (timeLimit == null || writeWatch.duration().seconds() >= timeLimit)

  // Write
  writeWatch.start()
  while (writesRemaining > 0 && reachedTimeLimit()) {
    writesRemaining--

    const { bytesWritten } = await fh.write(buffer, 0, blockSize)

    if (bytesWritten < blockSize) {
      throw new Error(`Only read ${c.orange(bytesWritten)} bytes`)
    }

    metrics.add('write.bytes.last', bytesWritten)
    metrics.add('write.bytes.total', bytesWritten)
  }
  await fh.datasync()
  await fh.close()

  console.info('Done writing.')
  writeWatch.stop()

  // Read
  if (writeOnly) {
    console.info('Skipping read portion.')
  } else {
    const fh = await pfs.open(file, 'r')
    let firstRead = true
    let done = false

    readWatch.start()
    while (!done) {
      const { bytesRead } = await fh.read(buffer, 0, blockSize, firstRead ? 0 : undefined)
      firstRead = false

      if (bytesRead < blockSize && bytesRead !== 0) {
        throw new Error(`Only read ${c.orange(bytesRead)} bytes`)
      }

      metrics.add('read.bytes.last', bytesRead)
      metrics.add('read.bytes.total', bytesRead)

      done = bytesRead === 0
    }
    readWatch.stop()

    console.info('Done reading.')
  }

  notify({ halt: true, force: true })

  const bytesWritten = metrics.get('write.bytes.total')
  const bytesRead = metrics.get('read.bytes.total')
  const writeSeconds = writeWatch.duration().seconds()
  const readSeconds = readWatch.duration().seconds()
  const writeRate = writeSeconds === 0 ? 0 : bytesWritten / writeSeconds
  const readRate = readSeconds === 0 ? 0 : bytesRead / readSeconds

  console.info(`Average Write Speed => ${c.orange(bytes(writeRate))}/${c.blue('s')}`)
  console.info(`Average Read  Speed => ${c.orange(bytes(readRate))}/${c.blue('s')}`)
}
