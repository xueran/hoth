import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import path from 'path';
import inquirer from 'inquirer';
import {mockProcessExit, mockConsoleLog} from 'jest-mock-process';
import {cli} from '../src/generate';

/* eslint-disable @typescript-eslint/no-var-requires */

const workdir = path.join(__dirname, 'workdir');

describe('hoth cli generate', () => {

    jest.mock('inquirer');

    beforeEach(() => {
        rimraf.sync(workdir);
    });

    it('errors if directory exists', async () => {
        mkdirp.sync(workdir);
        const mockExit = mockProcessExit();
        const mockLog = mockConsoleLog();
        await cli([workdir]);

        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockLog).toHaveBeenCalledWith(`Warn: directory ${workdir} already exists`);

        mockExit.mockRestore();
        mockLog.mockRestore();
    });

    it('errors if generate doesn\'t have <folder> arguments', async () => {
        const mockExit = mockProcessExit();
        const mockLog = mockConsoleLog();
        await cli([]);
        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockLog).toHaveBeenCalledWith('Warn: must specify a directory to \'hoth generate\'');

        mockExit.mockRestore();
        mockLog.mockRestore();
    });

    it('generate normal template', async () => {
        // @ts-ignore
        inquirer.prompt = jest.fn().mockResolvedValue({
            appName: 'myapp',
            appType: 'normal'
        });
        const mockLog = mockConsoleLog();
        await cli([workdir]);

        expect(mockLog).toHaveBeenCalledWith('generated package.json');
        const pkg = require(`${workdir}/package.json`);
        expect(pkg.name).toBe('@baidu/myapp-node-ui');
        expect(pkg.private).toBe(true);

        mockLog.mockRestore();
    });

    it('generate normal template', async () => {
        // @ts-ignore
        inquirer.prompt = jest.fn().mockResolvedValue({
            appName: 'myapp',
            appType: 'normal'
        });
        const mockLog = mockConsoleLog();
        await cli([workdir]);

        expect(mockLog).toHaveBeenCalledWith('generated package.json');
        const pkg = require(`${workdir}/package.json`);
        expect(pkg.name).toBe('@baidu/myapp-node-ui');
        expect(pkg.private).toBe(true);
        expect(pkg.devDependencies['@hoth/cli']).toBe(`^${require('../package.json').version}`);

        mockLog.mockRestore();
    });

    it('default app name', async () => {
        // @ts-ignore
        inquirer.prompt = jest.fn().mockImplementation(list => {
            const app = list[0];
            return {
                appName: app.default(),
                appType: 'normal'
            };
        });
        const mockLog = mockConsoleLog();
        await cli(['--app-name=myapp', workdir]);
        const pkg = require(`${workdir}/package.json`);
        expect(pkg.name).toBe('@baidu/myapp-node-ui');
        mockLog.mockRestore();
    });

    it('validate app name', async () => {
        // @ts-ignore
        inquirer.prompt = jest.fn().mockImplementation(list => {
            expect(list[0].validate('my-app')).toBe(true);
            expect(list[0].validate('my*app')).toBe('Please enter a valid product name.');
            return {
                appName: 'myapp',
                appType: 'normal'
            };
        });
        const mockLog = mockConsoleLog();
        await cli(['--app-name=myapp', workdir]);
        mockLog.mockRestore();
    });

    it('filter app type', async () => {
        // @ts-ignore
        inquirer.prompt = jest.fn().mockImplementation(list => {
            expect(list[1].filter('Normal')).toBe('normal');
            return {
                appName: 'myapp',
                appType: 'normal'
            };
        });
        const mockLog = mockConsoleLog();
        await cli([workdir]);
        mockLog.mockRestore();
    });

});
