const crypto = require('./crypto.js')
const filesystem = require('fs')
class VeryCrypt {
    constructor(name, secret) {
        this.name = name
        this.filelist = []
        this.container = []
        this.flow = []
        this.secret = secret
        this.last_iteration = ""
        this.last_index = 0
        this.flow_stamp = ""
    }
    add(filename) {
        const addDirectory = (directory) => {
            filesystem.readdirSync(directory, { withFileTypes: true }).forEach(dirent => {
                if (dirent.isDirectory()) {
                    this.addDirectory(directory + "/" + dirent.name);
                } else {
                    this.add(directory + "/" + dirent.name);
                }
            });
        }
        if (filesystem.lstatSync(filename).isDirectory()) addDirectory(filename)
        else this.filelist.push(filename)
    }
    containerize() {
        this.filelist.forEach(file => {
            this.container.push({
                filename: file,
                data: Buffer.from(filesystem.readFileSync(file)).toString('base64')
            })
        })
    }
    decontainerize() {
        this.container.forEach(file => {
            filesystem.writeFileSync(this.name + "/" + file.filename, Buffer.from(file.data, 'base64'))
        })
    }
    encrypt(algo, i) {
        try {
            if (this.last_iteration == "") this.last_iteration = JSON.stringify(this.container)
            this.last_iteration = crypto[algo].encrypt(this.last_iteration, this.secret)
            this.last_index = i
        } catch (e) {
            console.log(e)
        }
    }
    decrypt(algo, i) {
        try {
            if (this.last_iteration == "") throw Error("No data to decrypt")
            this.last_iteration = crypto[algo].decrypt(this.last_iteration, this.secret)
            this.last_index = i
        } catch (e) {
            console.log(e)
        }
    }
    saveContainer() {
        try {
            if (this.flow.length != this.last_index) throw Error("Flow length mismatch")
            const container = {
                name: this.name,
                stamp: this.flow_stamp,
                data: this.last_iteration
            }
            filesystem.writeFileSync(this.name + ".vec", JSON.stringify(container))
        } catch (e) {
            console.log(e)
        }
    }
    loadContainer(container) {
        try {
            const data = JSON.parse(filesystem.readFileSync(container).toString())
            if (data.stamp != this.flow_stamp) throw Error("Flow stamp mismatch")
            this.last_iteration = data
        }
        catch (e) {
            console.log(e)
        }
    }
    flow = {
        add(algo) {
            this.flow.push(algo)
            this.flow_stamp = crypto.md5(this.flow.join(","))
        },
        get() {
            return this.flow
        },
        set(flow) {
            this.flow = flow
            this.flow_stamp = crypto.md5(this.flow.join(","))
        }
    }

}


module.exports = VeryCrypt