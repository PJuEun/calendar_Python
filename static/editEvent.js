/*
일정 편집
*/
var editEvent = function (event, element) {

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

    $('#deleteEvent').data('id', event._id); //클릭한 이벤트 ID


    $('.popover.fade.top').remove();
    $(element).popover("hide");

    if (event.allDay === true) {
        editAllDay.prop('checked', true);
    } else {
        editAllDay.prop('checked', false);
    }

    if (event.end === null) {
        event.end = event.start;
    }

    if (event.allDay === true && event.end !== event.start) {
        editEnd.val(moment(event.end).subtract(1, 'days').format('YYYY-MM-DD HH:mm'))
    } else {
        editEnd.val(event.end.format('YYYY-MM-DD HH:mm'));
    }

    modalTitle.html('일정 수정');
    editTitle.val(event.title);
    editStart.val(event.start.format('YYYY-MM-DD HH:mm'));
    editType.val(event.type);
    editDesc.val(event.description);

    addBtnContainer.hide();
    modifyBtnContainer.show();
    eventModal.modal('show');

    //업데이트 버튼 클릭시
    $('#updateEvent').unbind();
    $('#updateEvent').on('click', function () {

        if (editStart.val() > editEnd.val()) {
            alert('끝나는 날짜가 앞설 수 없습니다.');
            return false;
        }

        if (editTitle.val() === '') {
            alert('일정명은 필수입니다.')
            return false;
        }

        var statusAllDay;
        var startDate;
        var endDate;
        var displayDate;

        if (editAllDay.is(':checked')) {
            statusAllDay = true;
            startDate = moment(editStart.val()).format('YYYY-MM-DD');
            endDate = moment(editEnd.val()).format('YYYY-MM-DD');
            displayDate = moment(editEnd.val()).add(1, 'days').format('YYYY-MM-DD');
        } else {
            statusAllDay = false;
            startDate = editStart.val();
            endDate = editEnd.val();
            displayDate = endDate;
        }

        eventModal.modal('hide');

        // 타입별로 배경색 지정
        if (editType.val() === '약속') {
            event.color = 'skyblue'
        } else if (editType.val() === '생일') {
            event.color = '#e6ccff'
        } else if (editType.val() === '적금') {
            event.color = '#ff8080'
        } else {
            event.color = 'pink'
        }

        event.allDay = statusAllDay;
        event.title = editTitle.val();
        event.start = startDate;
        event.end = displayDate;
        event.type = editType.val();
        event.description = editDesc.val();

        var eventData = {
            "id": event.id,
            "title": event.title,
            "start": event.start,
            "end": event.end,
            "type": event.type,
            "color": event.color,
            "description": event.description,
            "allDay": event.allDay
        }

        $("#calendar").fullCalendar('updateEvent', event);

        //일정 업데이트
        $.ajax({
            type: "PUT",
            url: "/calendar",
            contentType: "application/json",
            data: JSON.stringify(eventData),
            success: function(response) {
                alert('수정되었습니다.')
            }
        });

    });

    // 삭제버튼
    $('#deleteEvent').on('click', function () {

        $('#deleteEvent').unbind();
        $("#calendar").fullCalendar('removeEvents', $(this).data('id'));
        eventModal.modal('hide');

        const data = {
            "id": event.id
        }

        //삭제시
        $.ajax({
            type: "DELETE",
            url: "/calendar",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                alert('삭제되었습니다.');
            }
        });

    });
};

