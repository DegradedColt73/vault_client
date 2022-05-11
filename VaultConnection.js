let masterKey = "";

function veryfyIntegrity(id, password){
    fetch('http://127.0.0.1:8080/api/' + id)
        .then(response => response.text())
        .then(data => {
            let obj = JSON.parse(data);
            generateKeyHex(hexToBase64(obj.iv), password).then(key => {
                let encryptedBase64 = obj.checkMessage;
                let ivHex = obj.iv;
                let keyHex = key;
                let ciphertextWA = CryptoJS.enc.Base64.parse(encryptedBase64);
                console.log(key);
                let keyWA = CryptoJS.enc.Hex.parse(keyHex);
                let ivWA = CryptoJS.enc.Hex.parse(ivHex);
                let ciphertextCP = { ciphertext: ciphertextWA };
                let decrypted = CryptoJS.AES.decrypt(
                    ciphertextCP,
                    keyWA, 
                    { iv: ivWA }
                );
                console.log(decrypted);
                if (decrypted.toString(CryptoJS.enc.Utf8) === obj.id){
                    encryptedBase64 = obj.encryptedMasterKey;
                    ciphertextWA = CryptoJS.enc.Base64.parse(encryptedBase64);
                    ciphertextCP = {ciphertext: ciphertextWA};
                    masterKey = CryptoJS.AES.decrypt(ciphertextCP, keyWA, {iv: ivWA}).toString(CryptoJS.enc.Utf8);
                    startListing();
                }else{
                    $("#error-message").text("Ooops, provided password or vault ID is incorrect");
                }
            });
        })
        .catch(res => {
            $("#error-message").text("Ooops, provided password or vault ID is incorrect");
        })
}

function startListing(){
    $("#form-col").empty();
    fetch("http://127.0.0.1:8080/api/list")
        .then(response => response.text())
        .then(data => {
            console.log(data);
            let htmlList = `<ul class="list-group" id="list">`;
            let array = JSON.parse(data);
            for(let key of Object.keys(array)){
                let name = decryptEntity(array[key].iv, array[key].response);
                htmlList += `<li id="listItem` + key + `" class="list-group-item" onClick="setSideView(`+  key + `);">`+ name.substring(1, name.length - 1) +`</li>`;
            }
            htmlList += "</ul>";
            htmlList += `<br><button type="button" class="btn btn-primary btn-lg">+</button>   `
            htmlList += `<button onClick="exit();" type="button" class="btn btn-danger btn-lg">Quit</button>`
            $("#list-col").append(htmlList);
        });
}

function exit(){
    window.location.reload();
}

function setSideView(id){
    $("#list>li.active").removeClass('active');
    $("#listItem" + id).addClass("active");
    let iv = "";
    let data = ""
    fetch("http://127.0.0.1:8080/api/iv/" + id)
        .then(
            responseIv => responseIv.text()
            .then(responseIvText => {
                iv = responseIvText
                fetch("http://127.0.0.1:8080/api/fields/" + id)
                    .then(responseData => responseData.text())
                    .then(responseDataText => {
                        data = responseDataText
                        data = decryptEntity(iv, data);
                        setFields(data);
                    })
            })
        );
}

function setFields(rawData){
    $("#form-col").empty();
    let data = JSON.parse(rawData);
    console.log(data);
    let htmlFields = "";
    for(let key of Object.keys(data)){
        htmlFields += "<label class=\"form-label\">" + key + "</label>";
        if(data[key].fieldType === "PASSWORD"){
            htmlFields += `<input class="form-control form-field" type="text" value="` + data[key].fieldContent + '">';
        }
    }
    htmlFields += `<br><button type="button" class="btn btn-danger btn-lg">Remove</button>`;
    $("#form-col").append(htmlFields);
}

function decryptEntity(iv, text){
    let ciphertextWA = CryptoJS.enc.Base64.parse(text);
    let keyWA = CryptoJS.enc.Hex.parse(masterKey);
    let ivWA = CryptoJS.enc.Hex.parse(iv);
    let ciphertextCP = { ciphertext: ciphertextWA };
    let decrypted = CryptoJS.AES.decrypt(
        ciphertextCP,
        keyWA, 
        { iv: ivWA });
    return decrypted.toString(CryptoJS.enc.Utf8);
}