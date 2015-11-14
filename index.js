require("log-a-log");

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
    console.log(`Write ${writeCount - writesRemaining} of ${writeCount}`);
    reportWatch.reset().start();
  }

  fs.write(fd, buffer, 0, bufferSize, (error, written, buffer) => {
    if (error) {
      console.log("Error");
      console.log(`Error writing to file: ${error}`);
    } else if (writesRemaining > 0) {
      write(fd);
    } else {
      console.log("Done writing to file. Closing...");

      fs.close(fd, (error) => {
        if (error) {
          console.log("Error");
          console.log(`Error closing the file: ${error}`);
        } else {
          watch.stop();
          console.log(`Closed. Took ${watch} to write ${fileSize} bytes (${writeCount} MiB)`);
        }
      });
    }
  });
}

