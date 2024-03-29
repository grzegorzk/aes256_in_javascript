if (!("TextEncoder" in window))
    throw "Sorry, your browser needs to be updated before you can use this tool.";

// returns Promise
function get_AES_CBC_key_from_passphrase(passphrase){
    if (typeof passphrase != "string")
        throw "Cannot convert " + (typeof passphrase) + " to Uint8Array.";

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    return crypto.subtle.digest(
        {name: "SHA-256"}, // :param algorithm:
        (new TextEncoder()).encode(passphrase) // :param data:
    ).then(
        function(digest){
            // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
            return window.crypto.subtle.importKey(
                "raw", // :param format:
                digest, // :param keyData:
                {name: "AES-CBC"}, // :param algorithm:
                false, // :param extractable:
                ["encrypt", "decrypt"] // :param keyUsages:
            )
        }
        ,function(e){
            console.error(e);
        }
    );
}

// returns Promise
function AES_CBC_encrypt(encryption_key, init_vector, plaintext_payload)
{
    if (typeof plaintext_payload != "string")
        throw "Cannot convert " + (typeof plaintext_payload) + " to Uint8Array.";

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
    // This promise returns encrypted payload
    return window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: init_vector, // initialisation vector need not to be secret, is required when decrypting but is not enough alone in order to decrypt
        }, // :param algorithm: https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams
        encryption_key, // :param key:
        (new TextEncoder()).encode(plaintext_payload), // :param data:
    ).then(
        function(encrypted_payload){
            return encrypted_payload;
        }
        ,function(e){
            console.error(e);
        }
    );
}

// returns Promise
function encrypt_with_passphrase(passphrase, init_vector, plaintext_payload)
{
    return get_AES_CBC_key_from_passphrase(passphrase).then(
        function(generated_key){
            // Returns promise
            return AES_CBC_encrypt(generated_key, init_vector, plaintext_payload);
        }
        ,function(e){
            console.error(e);
        }
    );
}

// returns Promise
function AES_CBC_decrypt(decryption_key, init_vector, encrypted_payload)
{
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt
    // This promise returns decrypted (plain text) payload
    return window.crypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv: init_vector,
        }, // :param algorithm: https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams
        decryption_key, // :param key:
        encrypted_payload // :param data:
    ).then(
        function(plain_payload){
            return (new TextDecoder()).decode(plain_payload);
        }
        ,function(e){
            console.error(e);
        }
    )
}

// returns Promise
function decrypt_with_passphrase(passphrase, init_vector, encrypted_payload)
{
    return get_AES_CBC_key_from_passphrase(passphrase).then(
        function(generated_key){
            // Returns promise
            return AES_CBC_decrypt(generated_key, init_vector, encrypted_payload);
        }
        ,function(e){
            console.error(e);
        }
    );
}
