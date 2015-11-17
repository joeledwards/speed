require("log-a-log");

const bytes = require("bytes");
const durations = require("durations");
const fs = require("fs");

const bufferSize = 1024*1024;
const writeCount = 10000;
const fileSize = writeCount * bufferSize;
const buffer = new Buffer(bufferSize);
const testFile = "test.dat";
const watch = durations.stopwatch().start();
var writesRemaining = writeCount;

console.log("Opening file...");

const reportWatch = durations.stopwatch().start();
var reportBytes = 0;

fs.open(testFile, 'w', (error, fd) => {
  if (error) {
    console.log("Error");
    console.log(`Error opening file for write test: ${error}`);
  } else {
    write(fd);
  }
});

const write = (fd) => {
  writesRemaining--;
  if (reportWatch.duration().millis() >= 1000) {
    bps = reportBytes / reportWatch.duration().seconds()
    console.log(`Write ${writeCount - writesRemaining} of ${writeCount} : ${bytes(bps)}/s`);
    reportWatch.reset().start();
    reportBytes = 0;
  }

  fs.write(fd, buffer, 0, bufferSize, (error, written, buffer) => {
    if (error) {
      console.log("Error");
      console.log(`Error writing to file: ${error}`);
    } else if (writesRemaining > 0) {
      reportBytes += bufferSize;
      write(fd);
    } else {
      console.log("Done writing to file. Closing...");

      fs.close(fd, (error) => {
        if (error) {
          console.log("Error");
          console.log(`Error closing the file: ${error}`);
        } else {
          watch.stop();
          bps = fileSize / watch.duration().seconds()
          console.log(`Closed. Took ${watch} to write ${bytes(fileSize)} : ${bytes(bps)}/s`);
        }
      });
    }
  });
}

