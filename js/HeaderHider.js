function HeaderViewer(obj) {
    let hideTimeout;

    obj.style.transition = 'transform 0.3s ease';
    obj.style.transform = 'translateY(-93%)';

    obj.addEventListener('mouseover', function () {
        clearTimeout(hideTimeout);
        obj.style.transform = 'translateY(0)';
    });

    obj.addEventListener('mouseout', function () {
        hideTimeout = setTimeout(() => {
            obj.style.transform = 'translateY(-93%)';
        }, 500);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const obj = document.getElementById('header');
    if (obj) {
        HeaderViewer(obj);
    }
});