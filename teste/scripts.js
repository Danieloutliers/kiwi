document.addEventListener('DOMContentLoaded', function() {
    const linkPopup = document.getElementById('mostrarPopup');
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const fecharPopup = document.getElementById('fecharPopup');
    const fecharPopupText = document.getElementById('fecharPopupText');

    linkPopup.addEventListener('click', function(e) {
        e.preventDefault();
        popup.style.display = 'block';
        overlay.style.display = 'block';
    });

    fecharPopup.addEventListener('click', fecharPopUp);
    fecharPopupText.addEventListener('click', fecharPopUp);
    overlay.addEventListener('click', fecharPopUp);

    function fecharPopUp() {
        popup.style.display = 'none';
        overlay.style.display = 'none';
    }
});
