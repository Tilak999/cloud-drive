const child_process = require("child_process");

module.exports = function(command){
    return new Promise((resolve, reject)=>{
        child_process.exec(command, (error, stdout, stderr) => {
            if(error) reject(error)
            else resolve(stdout || stderr)
        });
    })
}