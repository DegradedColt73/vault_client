class VaultEntity{
    constructor(id, iv, name, data){
        this.id = id;
        this.iv = iv;
        this.nameEncrypted = name;
        this.dataEncrypted = data;
        this.ivWordArray = CryptoJS.enc.Hex.parse(iv);
        this.nameEncryptedWordArray = CryptoJS.enc.Base64.parse(name);
        this.dataEncryptedWordArray = CryptoJS.enc.Base64.parse(data);
    }

    decryptName(masterKeyWordArray){
        const name = CryptoJS.AES.decrypt(
            { ciphertext: this.nameEncryptedWordArray },
            masterKeyWordArray,
            { iv: this.ivWordArray }
        );
        this.name = name.toString(CryptoJS.enc.Utf8);
    }

    decryptData(masterKeyWordArray){
        const data = CryptoJS.AES.decrypt(
            { ciphertext: this.dataEncryptedWordArray },
            masterKeyWordArray,
            { iv: this.ivWordArray }
        );
        this.data = data.toString(CryptoJS.enc.Utf8);
    }
}