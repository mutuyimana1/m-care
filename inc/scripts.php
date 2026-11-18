<script src="assets/vendor/jquery/jquery.js"></script>
<script src="assets/jquery/jquery.min.js"></script>
<script src="assets/vendor/jquery-browser-mobile/jquery.browser.mobile.js"></script>
<script src="assets/vendor/bootstrap/js/bootstrap.js"></script>
<script src="assets/vendor/nanoscroller/nanoscroller.js"></script>
<script src="assets/vendor/bootstrap-datepicker/js/bootstrap-datepicker.js"></script>
<script src="assets/vendor/magnific-popup/magnific-popup.js"></script>
<script src="assets/vendor/jquery-placeholder/jquery.placeholder.js"></script>
<script src="assets/vendor/jquery-ui/js/jquery-ui-1.10.4.custom.js"></script>
<script src="assets/vendor/jquery-ui-touch-punch/jquery.ui.touch-punch.js"></script>
<script src="assets/vendor/jquery-appear/jquery.appear.js"></script>
<script src="assets/vendor/bootstrap-multiselect/bootstrap-multiselect.js"></script>
<script src="assets/vendor/select2/select2.js"></script>
<script src="assets/vendor/jquery-datatables/media/js/jquery.dataTables.js"></script>
<script src="assets/javascripts/tables/examples.datatables.default.js"></script>
<script src="assets/javascripts/ui-elements/examples.modals.js"></script>
<script src="assets/vendor/summernote/summernote.js"></script>
<script src="assets/javascripts/forms/examples.advanced.form.js"></script>
<script src="assets/javascripts/theme.js"></script>
<script src="assets/javascripts/theme.custom.js"></script>
<script src="assets/javascripts/theme.init.js"></script>
<script src="assets/javascripts/mcare-i18n.js"></script>
<script>
$(document).ready(function() {
    $('.select2').select2();
    $('.datepicker').datepicker({ format: 'yyyy-mm-dd', autoclose: true });
    var csrfToken = <?php echo json_encode($_SESSION['csrf_token'] ?? ''); ?>;
    $('form').each(function() {
        if (($(this).attr('method') || 'get').toLowerCase() === 'post' && !$(this).find('input[name="_csrf"]').length) {
            $('<input>', { type: 'hidden', name: '_csrf', value: csrfToken }).appendTo(this);
        }
    });
    var currentPage = (window.location.pathname.split('/').pop() || 'home').replace(/\.php$/, '');
    $('.nav-main a[href]').each(function() {
        var linkPage = ($(this).attr('href') || '').split('?')[0].replace(/\.php$/, '');
        if (linkPage === currentPage) {
            $(this).closest('li').addClass('active');
            $(this).parents('.nav-parent').addClass('nav-expanded active');
        }
    });
});
</script>
</body>
</html>
