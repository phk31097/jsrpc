const fs = require('fs');
const tar = require('tar');

const directory = './'; // Specify the directory containing the *.tgz file
const tempDirectory = './temp'; // Specify the temporary directory
const filesToAddDirectory = './dist/export'; // Specify the directory containing files to add
const fileTypesToAdd = ['.ts', '.js']; // Specify the file types to add

const tgzFile = fs.readdirSync(directory).find(file => file.endsWith('.tgz'));

if (!tgzFile) {
    console.error('No *.tgz file found in the directory');
    process.exit(1);
}

if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
}

tar.x({ file: `${directory}/${tgzFile}`, cwd: tempDirectory })
    .then(() => {
        const filesToAdd = fs.readdirSync(filesToAddDirectory).filter(file => {
            const fileType = getFileType(file);
            return fileTypesToAdd.includes(fileType);
        });
        filesToAdd.forEach(file => {
            fs.copyFileSync(`${filesToAddDirectory}/${file}`, `${tempDirectory}/${file}`);
        });

        tar.c({ gzip: true, file: `${directory}/${tgzFile}`, cwd: tempDirectory }, ['.'])
            .then(() => {
                console.log('Repacking completed successfully');
                fs.rmSync(tempDirectory, { recursive: true });
            })
            .catch(error => {
                console.error('Error repacking the archive:', error);
            });
    })
    .catch(error => {
        console.error('Error extracting the archive:', error);
    });

function getFileType(fileName) {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex !== -1 ? fileName.slice(dotIndex) : '';
}
