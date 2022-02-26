#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = (0, tslib_1.__importStar)(require("fs"));
const path = (0, tslib_1.__importStar)(require("path"));
const inquirer = (0, tslib_1.__importStar)(require("inquirer"));
const template = (0, tslib_1.__importStar)(require("./utils"));
const shell = (0, tslib_1.__importStar)(require("shelljs"));
console.log('Hi! I am a framework template generator \n');
const CHOICES = fs.readdirSync(path.join(__dirname, '..', 'src', 'templates'));
const PACKAGE_MANAGERS = ['yarn', 'npm', 'pnpm (recommended)'];
const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'Select the template you want to get',
        choices: CHOICES,
    },
    {
        name: 'name',
        type: 'input',
        message: 'Enter the name of your project: ',
    },
    {
        name: 'dependencies',
        type: 'confirm',
        message: 'Install dependencies?',
    },
    {
        name: 'package-manager',
        type: 'list',
        message: 'Do you want to install the dependencies with which package manager?',
        choices: PACKAGE_MANAGERS,
    },
];
const CURR_DIR = process.cwd();
inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = answers['template'];
    const projectName = answers['name'];
    const dependencies = answers['dependencies'];
    const packageManager = answers['package-manager'];
    const templatePath = path.join(__dirname, '..', 'src', 'templates', projectChoice);
    const targetPath = path.join(CURR_DIR, projectName);
    const options = {
        projectName,
        templateName: projectChoice,
        templatePath,
        targetPath,
    };
    if (!createProject(targetPath)) {
        return;
    }
    createDirectoryContents(templatePath, projectName);
    if (dependencies) {
        postProcess(options, packageManager);
    }
    console.log('\n Successfully!');
});
function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log(`Folder ${projectPath} exists. Delete or use another name.`);
        return false;
    }
    fs.mkdirSync(projectPath);
    return true;
}
const SKIP_FILES = ['node_modules', '.template.json', '.next', 'yarn.lock', 'package-lock.json'];
function createDirectoryContents(templatePath, projectName) {
    const filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);
        const stats = fs.statSync(origFilePath);
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf8');
            contents = template.render(contents, { projectName });
            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        }
        else if (stats.isDirectory()) {
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}
function postProcess(options, packageManager) {
    const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'));
    if (isNode) {
        shell.cd(options.targetPath);
        let result;
        if (packageManager == 'npm') {
            result = shell.exec('npm install');
        }
        else if (packageManager == 'yarn') {
            result = shell.exec('yarn');
        }
        else if (packageManager === 'pnpm (recommended)') {
            result = shell.exec('pnpm install');
        }
        else {
            return false;
        }
        if (result.code !== 0) {
            return false;
        }
    }
    return true;
}
