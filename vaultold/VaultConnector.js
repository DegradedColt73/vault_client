class VaultConnector {
    constructor(id, password, checkMessage, initializationVector, masterKey){
        this.id = id;
        this.password = password;
        //Base64
        this.checkMessageEncrypted = checkMessage;
        //HEX
        this.initializationVector = initializationVector;
        //Base64
        this.masterKeyEncrypted = masterKey;
        this.vault = null;
    }

    async setUpConnection(){
        this.recreateConfigKey().then(configKey => 
            this.decryptCheckMessage(configKey).then(checkMessage => {
                this.verifyCheckMessage(checkMessage)
            }));
        return new Promise((resolve, reject) => {
            if (this.vault == null){
                resolve('Authentication failed');
            } else{
                console.log(this.vault);
                reject('Authentication successful');
            }
        }) 
    };

    async recreateConfigKey(){
        return generateKeyHex(hexToBase64(this.initializationVector), this.password);
    }

    async decryptCheckMessage(configKey){
        const checkMessageEncryptedWordArray = CryptoJS.enc.Base64.parse(this.checkMessageEncrypted);
        const initializationVectorWordArray = CryptoJS.enc.Hex.parse(this.initializationVector);
        const configKeyWordArray = CryptoJS.enc.Hex.parse(configKey);
        const checkMessageWordArray = CryptoJS.AES.decrypt(
            {ciphertext: checkMessageEncryptedWordArray},
            configKeyWordArray,
            {iv: initializationVectorWordArray}
        );
        const checkMessage = checkMessageWordArray.toString(CryptoJS.enc.Utf8);
        return {checkMessage, configKey}
    }

    async verifyCheckMessage({ checkMessage, configKey }){
        const verifyStatus = (this.id === checkMessage) ? true : false;
            if(verifyStatus){
                const masterKeyEncryptedWordArray = CryptoJS.enc.Base64.parse(this.masterKeyEncrypted);
                const initializationVectorWordArray = CryptoJS.enc.Hex.parse(this.initializationVector);
                const configKeyWordArray = CryptoJS.enc.Hex.parse(configKey);
                const masterKeyWordArray = CryptoJS.AES.decrypt(
                    {ciphertext: masterKeyEncryptedWordArray},
                    configKeyWordArray,
                    {iv: initializationVectorWordArray}
                );
                const masterKey = masterKeyWordArray.toString(CryptoJS.enc.Utf8);
                this.vault = new Vault(this.id, this.initializationVector, masterKey);
            }
    }

}