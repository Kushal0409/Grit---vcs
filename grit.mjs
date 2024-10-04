#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { timeStamp } from 'console';
import {diffLines} from 'diff';
import { get } from 'https';
import chalk from 'chalk';
import {Command} from 'commander';

const program=new Command();

class Grit{
    constructor(repoPath='.'){
        this.repoPath= path.join(repoPath, '.grit')
        this.objectsPath=path.join(this.repoPath,'objects');
        this.headPath=path.join(this.repoPath,'HEAD');
        this.refsPath = path.join(this.repoPath, 'refs', 'heads');
        this.indexPath=path.join(this.repoPath,'index');
        this.undoLogPath = path.join(this.repoPath, 'undo-log.json');
        this.init();

    }

    async init() {
        await fs.mkdir(this.objectsPath,{recursive:true});
        try{
            await fs.writeFile(this.headPath,'',{flag:'wx'});//ws:open for writing.fails if file exits
            await fs.writeFile(path.join(this.refsPath, 'master'), '', { flag: 'wx' });
            await fs.writeFile(this.indexPath, JSON.stringify([]),{flag:'wx'})
            await fs.writeFile(this.undoLogPath, JSON.stringify([]), { flag: 'wx' });

        }catch(error)
        {
            console.log("Already initialised the .grit folder");
        }
    }

        async getCurrentBranch() {
        const headRef = await fs.readFile(this.headPath, 'utf-8');
        return path.basename(headRef.trim());
        }

        async switchBranch(branchName) {
            const branchPath = path.join(this.refsPath, branchName);
            if (!await this.branchExists(branchName)) {
                console.log(`Branch ${branchName} does not exist.`);
                return;
            }
            const branchCommit = await fs.readFile(branchPath, 'utf-8');
            await fs.writeFile(this.headPath, `refs/heads/${branchName}`);
            console.log(`Switched to branch ${branchName}`);
        }
    
        async createBranch(branchName) {
            const currentBranch = await this.getCurrentBranch();
            const currentCommit = await fs.readFile(path.join(this.refsPath, currentBranch), 'utf-8');
            const branchPath = path.join(this.refsPath, branchName);
            await fs.writeFile(branchPath, currentCommit);
            console.log(`Branch ${branchName} created.`);
        }
    
        async merge(branchToMerge) {
            const currentBranch = await this.getCurrentBranch();
            const currentCommit = await fs.readFile(path.join(this.refsPath, currentBranch), 'utf-8');
            const mergeCommit = await fs.readFile(path.join(this.refsPath, branchToMerge), 'utf-8');
    
            if (currentCommit === mergeCommit) {
                console.log(`Branch ${branchToMerge} is already up to date.`);
                return;
            }
    
            const mergeBase = currentCommit; // Simplified case: assume current commit is the merge base
    
            const commitData = {
                message: `Merged branch ${branchToMerge} into ${currentBranch}`,
                parent: [currentCommit, mergeCommit],
                timestamp: new Date().toISOString(),
                files: JSON.parse(await fs.readFile(this.indexPath, 'utf-8')),
            };
    
            const newCommitHash = this.hashObject(JSON.stringify(commitData));
            const newCommitPath = path.join(this.objectsPath, newCommitHash);
    
            await fs.writeFile(newCommitPath, JSON.stringify(commitData));
            await fs.writeFile(path.join(this.refsPath, currentBranch), newCommitHash);
    
            console.log(`Merged ${branchToMerge} into ${currentBranch}`);
        }

        hashObject(content){
            return crypto.createHash('sha1').update(content,'utf-8').digest('hex');
        }

        async add(fileToBeAdded){
            //fileToBeAdded :path/to/file
            const fileData=await fs.readFile(fileToBeAdded,{encoding:'utf-8'});  //read the file
            const fileHash=this.hashObject(fileData); //hash of the file
            console.log(fileHash);
            const newFileHashedObjectPath=path.join(this.objectsPath,fileHash); //.grit/objects/abc123
            await fs.writeFile(newFileHashedObjectPath,fileData);
            //One step missing : Add the file to the staging area  (Now added below)
            await this.updateStagingArea(fileToBeAdded,fileHash);
            await this.logUndoAction({ type: 'add', file: fileToBeAdded, hash: fileHash }); 
            console.log(`Added ${fileToBeAdded}`);  
        }

        async updateStagingArea(filePath,fileHash){
            const index=JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}))//read the index file
            index.push({path:filePath,hash:fileHash})//add the file to the index
            await fs.writeFile(this.indexPath,JSON.stringify(index));  //write the updated index file


        }

        async commit(message){
            const index=JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}));
            const parentCommit=await this.getCurrentHead();
            const commitData={
                timeStamp:new Date().toISOString(),
                message,
                files:index,
                parent:parentCommit
            };
            const commitHash=this.hashObject(JSON.stringify(commitData))
            const commitPath=path.join(this.objectsPath,commitHash);
            await fs.writeFile(commitPath,JSON.stringify(commitData));
            await fs.writeFile(this.headPath,commitHash);
            await fs.writeFile(this.indexPath,JSON.stringify([]));
            await this.logUndoAction({ type: 'commit', commit: commitHash });
            console.log(`Commit successfully created: ${commitHash}`)
        }

        async getCurrentHead(){
            try{
                return await fs.readFile(this.headPath,{encoding:'utf-8'});
            }catch(error){
                return null;
            }
        }

        async log(){
            let currentCommitHash=await this.getCurrentHead();
            while(currentCommitHash){
                const commitData=JSON.parse(await fs.readFile(path.join(this.objectsPath,currentCommitHash),{encoding:'utf-8'}));
                console.log(`-------------------------------\n`)
                console.log(`Commit: ${currentCommitHash}\nDate: ${commitData.timeStamp}\n\n${commitData.message}\n\n`);
                currentCommitHash=commitData.parent;
            }
        }

        async showCommitDiff(commitHash){
            const commitData=JSON.parse(await this.getCommitData(commitHash));
            if(!commitData){
                console.log("Commit not found")
                return;
            }
            console.log("Changes in the last commit area")

            for(const file of commitData.files){
                console.log(`File: ${file.path}`);
                const fileContent=await this.getFileContent(file.hash);
                console.log(fileContent);

                if(commitData.parent){
                    //get the parent commit data
                    const parentCommitData=JSON.parse(await this.getCommitData(commitData.parent));
                    const getParentFileContent= await this.getParentFileContent(parentCommitData,file.path);
                    if(getParentFileContent!= undefined){
                        console.log(`\nDiff:`);
                        // console.log(`Changes in ${file.path} are:`);
                        // console.log(getParentFileContent);
                        const diff=diffLines(getParentFileContent,fileContent);
                        // console.log(diff);
                        diff.forEach(part=>{
                            if(part.added){
                                process.stdout.write(chalk.green("++"+part.value));
                            } else if(part.removed){
                                process.stdout.write(chalk.red("--"+part.value));
                            }else{
                                process.stdout.write(chalk.grey(part.value));
                            }
                        });
                        console.log();
                    }else{
                        console.log("New file in this commit");
                    }
                }else{
                    console.log("First Commit");
                }
            }
        }

        async logUndoAction(action) {
            const undoLog = JSON.parse(await fs.readFile(this.undoLogPath, { encoding: 'utf-8' }));
            undoLog.push(action);
            await fs.writeFile(this.undoLogPath, JSON.stringify(undoLog));
        }
    
        async undo() {
            const undoLog = JSON.parse(await fs.readFile(this.undoLogPath, { encoding: 'utf-8' }));
            if (undoLog.length === 0) {
                console.log("No actions to undo.");
                return;
            }
    
            const lastAction = undoLog.pop();
            switch (lastAction.type) {
                case 'commit':
                    await this.undoCommit(lastAction.commit);
                    break;
                case 'add':
                    await this.undoAdd(lastAction.file, lastAction.hash);
                    break;
            }
    
            await fs.writeFile(this.undoLogPath, JSON.stringify(undoLog));
            console.log(`Undid last operation: ${lastAction.type}`);
        }
    
        async undoCommit(commitHash) {
            const currentBranch = await this.getCurrentBranch();
            const commitFilePath = path.join(this.objectsPath, commitHash);
            try {
                const commitData = JSON.parse(await fs.readFile(commitFilePath, { encoding: 'utf-8' }));
                const parentCommit = commitData.parent;
                await fs.writeFile(path.join(this.refsPath, currentBranch), parentCommit);
                console.log(`Undo commit: HEAD reset to ${parentCommit}`);
            } catch (error) {
                console.log("Failed to undo commit.");
            }
        }
    
        async undoAdd(filePath, fileHash) {
            const index = JSON.parse(await fs.readFile(this.indexPath, { encoding: 'utf-8' }));
            const updatedIndex = index.filter(entry => entry.path !== filePath);
            await fs.writeFile(this.indexPath, JSON.stringify(updatedIndex));
            const fileObjectPath = path.join(this.objectsPath, fileHash);
            await fs.unlink(fileObjectPath);
            console.log(`Undo add: Removed ${filePath} from staging.`);
        }
    


        async getParentFileContent(parentCommitData,filePath){
            const  parentFile=parentCommitData.files.find(file =>file.path==filePath);
            if(parentFile){
                return await this.getFileContent(parentFile.hash);
            }
        }

        async getCommitData(commitHash){
            const commitPath=path.join(this.objectsPath,commitHash);
            try{
                return await fs.readFile(commitPath,{encoding:'utf-8'});
            }catch(error){
                console.log("Failed to read the commit data",error);
                return null;
            }
        }

        async getFileContent(fileHash){
            const objectPath=  path.join(this.objectsPath,fileHash);
            return fs.readFile(objectPath,{encoding:'utf-8'})
        }

}

// (async()=>{
//     const grit=new Grit()
//     // await grit.add('sample.txt')
//     // await grit.add('sample2.txt')
//     // await grit.commit('6th commit')

//     // await grit.log();
//     await grit.showCommitDiff('593da9822611f187e47d6a07a0084d769f138337');
// })();

program.command('init').action(async()=>{
    const grit=new Grit();
});

program.command('add <file>').action(async(file)=>{
    const grit=new Grit();
    await grit.add(file);
});

program.command('commit <message>').action(async(message)=>{
    const grit=new Grit();
    await grit.commit(message);
});

program.command('log').action(async()=>{
    const grit=new Grit();
    await grit.log();
});

program.command('show <commandHash>').action(async(commitHash)=>{
    const grit=new Grit();
    await grit.showCommitDiff(commitHash);
});

program.command('branch <branchName>').action(async (branchName) => {
    const grit = new Grit();
    await grit.createBranch(branchName);
});

program.command('checkout <branchName>').action(async (branchName) => {
    const grit = new Grit();
    await grit.switchBranch(branchName);
});

program.command('merge <branchName>').action(async (branchName) => {
    const grit = new Grit();
    await grit.merge(branchName);
});

program.command('undo').action(async () => {
    const grit = new Grit();
    await grit.undo();
});


// console.log(process.argv);
program.parse(process.argv);