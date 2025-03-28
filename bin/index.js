#! /usr/bin/env node
const commander = require("commander");
const program = new commander.Command();

const fs = require("fs");
const glob = require("glob");
const cheerio = require("cheerio");
const nodeEmoji = require("node-emoji");
const chalk = require("chalk");
// const chalk = new c.Chalk(); // chalk 5+

program
  .name('validate-data-testid')
  .description('A CLI tool to validate if the data-testid attribute is set in the html.')
  .version('0.0.2');

program.option('-t, --tag <type>', 'html tag to be validated', 'div');

program.parse();

const tag = program.opts()?.tag;

const filesNames = glob.sync("**/*.html", { nodir: true, ignore: ["node_modules/**", "coverage/**"] });

let isMissingDataTestid = false;

console.log(chalk.bold.blue(`Validating HTML files without data-testid attribute. Found ${filesNames?.length} file${filesNames?.length > 1 ? 's' : ''}...\n`));

filesNames.forEach(fileName => {
    const fileContent = fs.readFileSync(fileName, "utf-8");
    const $ = cheerio.load(fileContent);
    const elementsWithoutDataTestid = $(`${tag}:not([data-testid]), ${tag}[data-testid=""]`)?.filter(
        (_, el) => !el.attribs?.['attr.data-testid'] && !el.attribs?.['attr.data-testId']
    );

    if (elementsWithoutDataTestid?.length) {
        isMissingDataTestid = true;

        console.log(chalk.yellow(nodeEmoji.emojify(`:warning:  File: ${fileName} - Elements without data-testid: ${elementsWithoutDataTestid?.length}`)));

        elementsWithoutDataTestid.each((index, element) => {
            console.log(chalk.red(nodeEmoji.emojify(`:exclamation: Element ${index + 1} ${element.name} without data-testid`)));
        });

        console.log('');
    }
});

if (isMissingDataTestid) {
    console.log(chalk.red.bold(nodeEmoji.emojify(":x: data-testid validation ended with errors!")));
    process.exit(1);
} else {
    console.log(chalk.green.bold(nodeEmoji.emojify(":white_check_mark: data-testid validation completed successfully!")));
    process.exit(0);
}

