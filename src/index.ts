#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as inquirer from 'inquirer'
import * as shell from 'shelljs'
import { Answers } from 'inquirer'
import { ShellString } from 'shelljs'
import { templateRender } from '@utils'

console.log('Hi! I am a framework template generator \n')

const CHOICES = fs.readdirSync(path.join(__dirname, '..', 'src', 'templates'))
const PACKAGE_MANAGERS = ['yarn', 'npm', 'pnpm (recommended)', 'do not install dependencies']

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
        name: 'package-manager',
        type: 'list',
        message: 'Do you want to install the dependencies with which package manager?',
        choices: PACKAGE_MANAGERS,
    },
]

export interface CliOptions {
    projectName: string
    templateName: string
    templatePath: string
    targetPath: string
}

const CURR_DIR = process.cwd()

inquirer.prompt(QUESTIONS).then((answers: Answers) => {
    const projectChoice = answers['template']
    const projectName = answers['name']
    const packageManager = answers['package-manager']

    const templatePath = path.join(__dirname, '..', 'src', 'templates', projectChoice)
    const targetPath = path.join(CURR_DIR, projectName)

    const options: CliOptions = {
        projectName,
        templateName: projectChoice,
        templatePath,
        targetPath,
    }

    if (!createProject(targetPath)) {
        return
    }

    createDirectoryContents(templatePath, projectName)
    postProcess(options, packageManager)

    if (projectChoice === 'next-extensive-template' && packageManager !== 'do not install dependencies') {
        const manager = packageManager.toString().replace(' (recommended)', '').trim()

        shell.exec(`${manager} build`)
        shell.exec(`${manager} start`)
    } else console.log('\n Successfully!')
})

function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(`Folder ${projectPath} exists. Delete or use another name.`)
        return false
    }

    fs.mkdirSync(projectPath)
    return true
}

const SKIP_FILES = ['node_modules', '.template.json', 'yarn.lock', 'package-lock.json']

function createDirectoryContents(templatePath: string, projectName: string) {
    const filesToCreate = fs.readdirSync(templatePath)

    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file)

        const stats = fs.statSync(origFilePath)

        if (SKIP_FILES.indexOf(file) > -1) return

        if (stats.isFile()) {
            let contents: string | Buffer = fs.readFileSync(
                origFilePath,
                /png|jpg|jpeg|ico/.test(origFilePath) ? 'base64' : 'utf8'
            )

            contents = templateRender(contents, { projectName })!
            const writePath = path.join(CURR_DIR, projectName, file)

            fs.writeFileSync(writePath, contents, /png|jpg|jpeg|ico/.test(origFilePath) ? 'base64' : 'utf8')
        } else if (stats.isDirectory()) {
            fs.mkdirSync(path.join(CURR_DIR, projectName, file))
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file))
        }
    })
}

function postProcess(options: CliOptions, packageManager: string) {
    const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'))

    if (isNode) {
        shell.cd(options.targetPath)
        let result: ShellString

        if (packageManager == 'npm') result = shell.exec('npm install')
        else if (packageManager == 'yarn') result = shell.exec('yarn')
        else if (packageManager === 'pnpm (recommended)') result = shell.exec('pnpm install')
        else return false

        if (result.code !== 0) {
            return false
        }
    }
    return true
}
