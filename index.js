const filesystem = require('fs');
const readDecrypted = (filename) => {
    const data_buffer = filesystem.readFileSync(filename);
    return {
        data: JSON.stringify(data_buffer),
        filename: filename
    }
}
const writeDecrypted = (filename, decrypted) => {
    const decrypted_buffer = Buffer.from(JSON.parse(decrypted).data,"binary");
    console.log(decrypted_buffer)
    filesystem.writeFile(filename, decrypted_buffer,"binary", (err) => {
        if (err) throw err;
        
    });
    return {
        data: decrypted_buffer,
        filename: filename
    }
}
const readEncrypted = (filename) => {
    return {
        data: filesystem.readFileSync(filename).toString(),
        filename: filename
    }
}
const writeEncrypted = (filename, encrypted) => {
    filesystem.writeFileSync(filename, encrypted);
    return {
        data: encrypted,
        filename: filename
    }
}
const getEncrypted = (filename,fileData, algo, secret) => {
    console.log(algo)
    const thisAlgo = require('crypto-js')[algo];
    console.log(thisAlgo)
    const encrypted = thisAlgo.encrypt(fileData, secret.toString());
    const data_ = encrypted.toString();
    return {
        data: data_,
        filename: filename
    }
}
const getDecrypted = (filename,fileData, algo, secret) => {
    const decrypted = require('crypto-js')[algo].decrypt(fileData, secret.toString());
    const decrypted_ = decrypted.toString(require('crypto-js/enc-utf8'));
    console.log(decrypted_)
    return {
        data: decrypted_,
        filename: filename
    }
}

const flow = [
    "AES",
    "DES",
    "TripleDES",
    "Rabbit",
    "RC4",
]

const files = [
    "EvilMortyS3.webp",
]
const secret_ = "test";
const encrypt_cascade = (file, flow, secret) => {
    var check_name = "";
    var last = readDecrypted(file);
    flow.forEach((algo) => {
        check_name += algo + "_"
        console.log(check_name)
        const encrypted = getEncrypted(last.filename,last.data, algo, secret);
        last = encrypted;
    })
    return writeEncrypted(check_name + file, last.data);
}
const decrypt_cascade = (file, flow, secret) => {
    var last = readEncrypted(file);
    var check_name = last.filename;
    flow.forEach((algo) => {
        check_name = check_name.replace(algo + "_", "");
        const decrypted = getDecrypted(last.filename,last.data, algo, secret);
        last = decrypted;
    })
    writeDecrypted("decrypted_"+check_name, last.data);
}

const encrypted = encrypt_cascade("EvilMortyS3.webp", flow, secret_).filename
console.log(encrypted)
//const encrypted = 'AES_DES_TripleDES_Rabbit_RC4_EvilMortyS3.webp';
decrypt_cascade(encrypted, flow.reverse(), secret_);