$(function() {
	$(".alert-dismissable").fadeTo(2000, 500).slideUp(500, function(){
	    $(".alert-dismissable").slideUp(500);
	});

	$('ul.nav a').filter(function() {
		var url = window.location;
    return this.href == url;
	}).parent().addClass('active');
});