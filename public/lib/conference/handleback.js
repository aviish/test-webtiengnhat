jQuery(document).ready(function($) {

    if (window.history && window.history.pushState) {
        $(window).on('popstate', function(event) {
            var hashLocation = location.hash;
            var hashSplit = hashLocation.split("#!/");
            var hashName = hashSplit[1];
            if (hashName !== '') {
                var hash = window.location.hash;
                if (hash === '' && window.location.href !== '/') {
                    if (confirm('Leave This Conference?')) {
                        window.location = '/';
                    } else {
                        window.history.pushState('forward', null, window.location.href);
                    }
                }
            }
        });
    //    window.history.pushState('forward', null, location.href);
    }
});
