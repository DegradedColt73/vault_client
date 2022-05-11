const b64binb = base64String => Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
const str2binb = str => new TextEncoder().encode(str);
const buf2hex = buffer => Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');

async function pbkdf2_generate_key_from_string(string) { 
    return crypto.subtle.importKey(
        "raw",
        str2binb(string),
        {
            name: "PBKDF2",
        },
        false,
        ["deriveKey", "deriveBits"], 
    );
}

async function pbkdf2_derive_salted_key(key, salt, iterations) {  
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: iterations,
            hash: {name: "SHA-1"}
        },
        key,
        {
            name: "HMAC",
            hash: "SHA-1",
            length: 256
        },
        true,
        ["sign", "verify"]
    );
}

function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function base64ToHex(str) {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toLowerCase();
  }

async function generateKeyHex2(saltB64, passwordRaw){
    iv = b64binb(saltB64);
    key = await pbkdf2_generate_key_from_string(passwordRaw);
    finalKey = await pbkdf2_derive_salted_key(key, iv, 1000);

    return buf2hex(await window.crypto.subtle.exportKey("raw", finalKey));
}




async function generateKeyHex(saltB64, password){
    salt = b64binb(saltB64);
    key = await pbkdf2_generate_key_from_string(password);
    console.log(key);
    x = await pbkdf2_derive_salted_key(key, salt, 1000)

    let result = buf2hex(await window.crypto.subtle.exportKey("raw", x))

    return result
}