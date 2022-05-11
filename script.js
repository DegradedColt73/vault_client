$( document ).ready(function() {
    $("#connection-form").submit(function(e) {
        e.preventDefault();
        let id = $("#vaultId").val();
        let password = $("#vaultPassword").val();
        console.log(id + password);
        veryfyIntegrity(id, password);
    });
});