class Vault{
    constructor(id, iv, masterKey){
        this.id = id;
        this.iv = iv;
        this.masterKeyHex = masterKey;
        this.masterKeyWordArray = CryptoJS.enc.Hex.parse(masterKey);
    }

    generateUUID(){
        this.uuid = crypto.randomUUID();
    }

}