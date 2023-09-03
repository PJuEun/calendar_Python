/*
일정 추가
*/


var newEvent = function (start, end, eventType) {

    var eventModal = $('#eventModal'); // # : ID 선택자
    var modalTitle = $('.modal-title'); // . : 클래스 선택자
    var editAllDay = $('#edit-allDay');
    var editTitle = $('#edit-title');
    var editStart = $('#edit-start');
    var editEnd = $('#edit-end');
    var editType = $('#edit-type');
    var editDesc = $('#edit-desc');

    var addBtnContainer = $('.modalBtnContainer-addEvent');
    var modifyBtnContainer = $('.modalBtnContainer-modifyEvent');

    $("#contextMenu").hide(); //메뉴 숨김

    modalTitle.html('새로운 일정');
    editType.val(eventType).prop('selected', true); // 일정 유형을 선택하는 드롭다운 메뉴에서 eventType 값을 선택
    editTitle.val('');
    editStart.val(start);
    editEnd.val(end);
    editDesc.val('');

    addBtnContainer.show();
    modifyBtnContainer.hide();
    eventModal.modal('show');

    //새로운 일정 저장버튼 클릭
    $('#save-event').unbind();
    $('#save-event').on('click', function () {

        // 색깔 수정하기
        if (editType.val() === '약속') {
            color = 'skyblue'
        } else if (editType.val() === '생일') {
            color = '#e6ccff'
        } else if (editType.val() === '적금') {
            color = '#ff8080'
        } else {
            color = 'pink'
        }

        var eventData = {
            title: editTitle.val(),
            start: editStart.val(),
            end: editEnd.val(),
            type: editType.val(),
            color: color,
            description: editDesc.val(),
            allDay: editAllDay.val()
        };

        if (eventData.start > eventData.end) {
            alert('끝나는 날짜가 앞설 수 없습니다.');
            return false;
        }

        if (eventData.title === '') {
            alert('일정명은 필수입니다.');
            return false;
        }

        var realEndDay;

        if (editAllDay.is(':checked')) {
            eventData.start = moment(eventData.start).format('YYYY-MM-DD');
            //render시 날짜표기수정
            eventData.end = moment(eventData.end).add(1, 'days').format('YYYY-MM-DD');
            eventData.allDay = true;
        } else {
            eventData.allDay = false;
        }

        $("#calendar").fullCalendar('renderEvent', eventData, true);
        eventModal.find('input, textarea').val('');
        editAllDay.prop('checked', false);
        eventModal.modal('hide');

        //새로운 일정 저장
        $.ajax({
            type: "POST",
            url: "/calendar",
            contentType: "application/json",
            data: JSON.stringify(eventData),
            success: function(response) {
                alert('저장되었습니다.');
            }
        });
    });
};