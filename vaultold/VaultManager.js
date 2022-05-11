class VaultManager{
    constructor(vaultConnector){
        this.vaultConnector = vaultConnector;
        this.vaultEntities = [];
        this.names = [];
    }

    decryptNames(vault){
        this.vaultEntities.forEach((element) => {
            this.vault = vault;
            const ivWordArray = CryptoJS.enc.Hex.parse(element.iv);
            const nameEncryptedWordArray = CryptoJS.enc.Base64.parse(element.nameEncrypted);
            const nameWordArray = CryptoJS.AES.decrypt(
                { ciphertext: nameEncryptedWordArray },
                this.vault.masterKeyWordArray,
                { iv: ivWordArray }
            );
            this.names.push({ id: element.id, name: nameWordArray.toString(CryptoJS.enc.Utf8) });
        });
    }

    setVaultEntities(vaultEntities){
        this.vaultEntities = vaultEntities;
    }
}