const theLib = require('crypto-js');
const filesystem = require('fs');

const getEncrypted = (filename, algo, secret) => {
    //read the file
    const data_buffer = filesystem.readFileSync(filename);
    const data = JSON.stringify(data_buffer);
    //console.log(data)
    filesystem.writeFileSync('test_'+filename, data, 'utf8');
    const encrypted = require('crypto-js')[algo].encrypt(data, "test");
    const data_ = encrypted.toString();
    //write the file
    filesystem.writeFileSync('enc_' + algo + filename, data_);
}
const getDecrypted = (filename, algo, secret) => {
    //read the file
    const data = filesystem.readFileSync('enc_' + algo + filename).toString();
    const decrypted = require('crypto-js')[algo].decrypt(data, "test");
    const decrypted_ = decrypted.toString(require('crypto-js/enc-utf8'));
    console.log(decrypted_)
    const decrypted_buffer = Buffer.from(JSON.parse(decrypted_).data);
    //write the file
    filesystem.writeFileSync('dec_' + algo + filename, decrypted_buffer);
}


const flow = [ //encrypt the encrypted mfker 😂
    "AES",
    "DES",
    "TripleDES",
    "Rabbit",
    "RC4",
]

const files = [
    "EvilMortyS3-1.webp",
    "alarm.mp3"
]
const secret_ = "test";

flow.forEach((algo) => {
    files.forEach((file) => {
        console.log("testing " + algo, secret_);
        getEncrypted(file, algo, secret_);
        getDecrypted(file, algo, secret_);
    })
});
