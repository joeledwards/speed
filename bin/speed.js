#! /usr/bin/env node

const app = require('@buzuli/app')
const yargs = require('yargs')

app({
})(async () => {
  yargs
    .commandDir('../commands')
    .demandCommand()
    .strict()
    .help()
    .parse()
})
