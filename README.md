# speed

System speed test utilities.

## disk

### usage
```
$ speed disk

test disk speed (writes, reads)

Options:
      --version            Show version number                         [boolean]
      --help               Show help                                   [boolean]
      --block-count, --bc  the number of blocks to write then read
                                                       [number] [default: 10000]
      --block-size, --bs   the size of blocks to write
                                                     [number] [default: 1048576]
  -f, --file               the test file where data should be written
                                            [string] [default: "speed-test.dat"]
      --overwrite          overwrite the file if it exists             [boolean]
      --time-limit, --tl   limit to a write duration of this many floating-point
                           seconds                                      [number]
      --write-only, --wo   just write; do not perform the subsequent read stage
                                                                       [boolean]
```

### sample
```
 ./bin/speed.js disk
[2021-02-27T09:47:03.538Z]INFO> Opening file...
[2021-02-27T09:47:03.694Z]INFO> Write=0B/s   Read=0B/s
[2021-02-27T09:47:04.695Z]INFO> Write=2.82GB/s   Read=0B/s
[2021-02-27T09:47:05.695Z]INFO> Write=2.65GB/s   Read=0B/s
[2021-02-27T09:47:06.695Z]INFO> Write=2.67GB/s   Read=0B/s
[2021-02-27T09:47:07.474Z]INFO> Done writing.
[2021-02-27T09:47:07.695Z]INFO> Write=1.62GB/s   Read=572MB/s
[2021-02-27T09:47:08.695Z]INFO> Write=0B/s   Read=3.27GB/s
[2021-02-27T09:47:09.696Z]INFO> Write=0B/s   Read=3.01GB/s
[2021-02-27T09:47:10.667Z]INFO> Done reading.
[2021-02-27T09:47:10.667Z]INFO> Write=0B/s   Read=2.93GB/s
[2021-02-27T09:47:10.667Z]INFO> Average Write Speed => 2.58GB/s
[2021-02-27T09:47:10.667Z]INFO> Average Read  Speed => 3.06GB/s
```

