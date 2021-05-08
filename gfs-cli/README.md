# CLI Tool

This cli tool provides basic commands to interact with the cloud storage.

## Setup

```sh
# Clone the repository if not already done
git clone https://github.com/Tilak999/cloud-drive.git

# install cli as global tool
npm install -g .
```

CLI will look for masterKey.json at `~/.gfs` directory, if not found it will check if `GFS_KEY_FILE` variable is set and pointing to masterKey.json file in current shell environment or not.

```sh

# create key file directory
mkdir ~/.gfs
mv ./masterKey.json ~/.gfs

```

## Basic usage

```sh
Usage: gfs [options] [command]

Options:
  -V, --version                    output the version number
  -d, --debug                      output extra debugging
  -h, --help                       display help for command

Commands:
  ls [options] <source>            List all the files at the give path.
  mkdir <source> <dirName>         Create new directory at <source> with provided name.
  upload <source> <destination>    Upload file/directory to <source> path.
  download <source> <destination>  Download file from gfs to local system.
  rm [options] <path>              Remove file/directory from <path>
  storage [list]                   Get storage information.
  help [command]                   display help for command
```

## List files

List all the files and directories at `root`.

```sh
gfs ls gfs:/
```
List all the files and directories in `music`

```sh
gfs ls gfs:/music
```

Get Web link of the file

```sh
gfs ls --weblink gfs:/music/sample.mp3
```

## Create directory

```sh
gfs mkdir gfs:/ <directory_name>
```

## Upload files and directory

```sh
# Upload single file in music 
gfs upload ./music/sample.mp3 gfs:/music
```

```sh
# upload complete `docs` directory at root
gfs upload ./docs gfs:/
```

## Download files and directory

```sh
# Download single file in music 
gfs download gfs:/music/sample.mp3 ./music
```

```sh
# Download complete `music` directory at root
gfs upload gfs:/music ./
```


## Delete files and directory

For deleting file

```sh
# Download single file in music 
gfs rm gfs:/music/sample.mp3
```

For deleting directory, second arg should be `true`

```sh
# Download complete `music` directory at root
gfs rm -r gfs:/music
```

## Get storage information

``` sh
gfs storage
```
