module.exports = {
    isValidGfsPath(path){
        return path && path.startsWith("gfs:/")
    }
}