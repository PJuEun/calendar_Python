$(document).ready(function() {
    //필터
    $('.filter').on('change', function () {
        $('#calendar').fullCalendar('rerenderEvents');
    });

    $("#type_filter").select2({
        placeholder: "선택..",
        allowClear: true
    });

    // datetimepicker
    $("#edit-start, #edit-end").datetimepicker({
        format: 'YYYY-MM-DD HH:mm'
    });

});