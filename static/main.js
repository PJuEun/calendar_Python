var activeInactiveWeekends = true; // 주말에 대한 일정 허용 (주말 보여주기)

    $(document).ready(function() {
        $('#calendar').fullCalendar({ // jQuery를 사용하여 id가 calendar인 요소에 fullcalendar을 초기화
            height                      : 650, // 달력의 높이를 650px
            header                      : { // 달력의 헤더를 설정
                                            left: '', // 왼쪽 : 비워둠
                                            center: 'prev, title, next', // 중앙 : 이전/제목/다음
                                            right: '', // 오른쪽 : 비워둠
                                        },
            defaultView                 : 'month', // 페이지를 열었을 때 기본으로 월(Month)뷰로 달력표시
            editable                    : true, // 달력 내에서 이벤트를 편집가능 (기존일정 수정할때 용이할듯)
            droppable                   : true, // 달력 내에서 드래그 앤 드롭으로 이벤트 추가 가능

            displayEventTime            : true, // 이벤트의 시간을 표시
            displayEventEnd             : true, // 이벤트의 종료 시간 정보를 표시할지 여부
            timeFormat                  : 'HH:mm', // 시간 표시 형식 설정
            selectable                  : true, // 사용자가 일정을 선택할 수 있는지 여부
            navLinks                    : true, // 캘린더 내비게이션 링크를 활성화할지 여부 설정


            events: function(start, end, timezone, callback){ // 이벤트를 가져오는 함수
                $.ajax({
                    type: "GET",
                    url: "/calendar",
                    success: function(response) {
                        const dict_data = [] // {}:객체 / []:배열

                        for (let i=0; i < response.length; i++) {
                            const res = response[i];
                            const id = res.id;
                            const title = res.title;
                            const start = res.start;
                            const end = res.end;
                            const type = res.type;
                            const color = res.color;
                            const description = res.description;
                            const allDay = res.allDay === 1 ? true : false;

                            dict_data.push({
                                id: id,
                                title: title,
                                start: start,
                                end: end,
                                type: type,
                                color: color,
                                description: description,
                                allDay: allDay
                            });
                        }
                        callback(dict_data);
                    }
                })
            },

            eventClick: function(event, jsEvent) { // 이벤트를 클릭했을때 호출되는 함수
                editEvent(event);
            },

            select: function (startDate, endDate, jsEvent) { // 날짜범위를 선택했을때 호출되는 함수
                $(".fc-body").unbind('click'); // fc-body클래스를 가진 요소에 대한 클릭 이벤트를 먼저 해제(클릭 이벤트를 중복으로 바인딩하지 않기 위함)
                $(".fc-body").on('click', 'td', function (e) { // fc-body클래스를 가진 요소 내의 td 요소들에 대한 클릭 이벤트 핸들러를 설정(사용자가 달력의 날짜셀을 클릭할때 동작할 내용을 정의하는 부분)

                  $("#contextMenu")
                    .addClass("contextOpened") // 컨텍스트 메뉴가 열린 상태를 나타내는 스타일
                    .css({
                      display: "block",
                      left: e.pageX, // 메뉴가 마우스 클릭한 위치의 가로 좌표에 나타남
                      top: e.pageY // 메뉴가 마우스 클릭한 위치의 세로 좌표에 나타남
                    });
                  return false; // 이벤트 핸들러 함수 내에서 사용될 때, 해당 이벤트의 기본 동작과 이벤트 버블링을 모두 막는 역할
                });

                var today = moment(); // 현재 시간과 날짜 정보는 today에 저장
                startDate.set({ // startDate 변수가 가리키는 날짜 객체의 시간을 현재 시간으로 설정
                    hours: today.hours(),
                    minute: today.minutes()
                });
                startDate = moment(startDate).format('YYYY-MM-DD HH:mm'); // startDate 형식 변환
                endDate = moment(endDate).subtract(1, 'days'); // endDate 변수가 가리키는 날짜 객체에서 하루를 뺀 날짜로 설정

                endDate.set({
                  hours: today.hours() + 1,
                  minute: today.minutes()
                });
                endDate = moment(endDate).format('YYYY-MM-DD HH:mm');

                //날짜 클릭시 카테고리 선택메뉴
                var $contextMenu = $("#contextMenu");
                $contextMenu.on("click", "a", function (e) { // contextMenu 요소 내부에서 <a>태그가 클릭되었을 때 실행할 핸들러 함수를 정의
                  e.preventDefault(); // 이벤트의 기본 동작을 취소하는 메소드(링크 클릭시 페이지가 이동하지 않고 다른 동작을 수행하도록 함)

                  //닫기 버튼이 아닐때
                  if ($(this).data().role !== 'close') { // $(this).data().role => data-role을 뜻함
                    newEvent(startDate, endDate, $(this).html()); // .html() : 해당 요소의 내용을 반환
                  }

                  $contextMenu.removeClass("contextOpened");
                  $contextMenu.hide();
                });

                $('body').on('click', function () { // <body> 요소를 선택했을 때
                  $contextMenu.removeClass("contextOpened");
                  $contextMenu.hide();
                });
            },

            //일정 리사이즈
          eventResize: function (event, delta, revertFunc, jsEvent, ui, view) { // 사용자가 캘린더에서 이벤트의 크기를 조절하거나 리사이즈할때 발생하는 이벤트
            $('.popover.fade.top').remove();

            /** 리사이즈시 수정된 날짜반영
             * 하루를 빼야 정상적으로 반영됨. */
            var newDates = calDateWhenResize(event);

            const data = {
                    "event_id": event.id, // 업데이트할 일정의 고유 식별자
                    "start": newDates.startDate, // 드롭한 일정의 새로운 시작 날짜
                    "end": newDates.endDate, // 드롭한 일정의 새로운 종료 날짜
                }

                //드롭한 일정 업데이트
                $.ajax({
                  type: "PUT",
                  url: "/calendar/stat",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  success: function (response) {
                    alert('수정: ' + newDates.startDate + ' ~ ' + newDates.endDate);
                  }
                });

          },


            //일정 드래그앤드롭
            eventDrop: function (event, delta, revertFunc, jsEvent, ui) {
                $('.popover.fade.top').remove();

                // 드랍시 수정된 날짜반영
                var newDates = calDateWhenDragnDrop(event);

                const data = {
                    "event_id": event.id, // 업데이트할 일정의 고유 식별자
                    "start": newDates.startDate, // 드롭한 일정의 새로운 시작 날짜
                    "end": newDates.endDate, // 드롭한 일정의 새로운 종료 날짜
                }

                //드롭한 일정 업데이트
                $.ajax({
                  type: "PUT",
                  url: "/calendar/stat",
                  contentType: "application/json",
                  data: JSON.stringify(data),
                  success: function (response) {
                    alert('수정: ' + newDates.startDate + ' ~ ' + newDates.endDate);
                  }
                });
            },

            eventRender: function (event, element) { // 이벤트가 렌더링될때 호출되는 함수
                element.popover({
                    title: $('<div />', {
                    class: 'popoverTitleCalendar',
                    text: event.title
                  }).css({
                    'background': event.color,
                    'color' : 'white'
                  }),
                  content: $('<div />', {
                      class: 'popoverInfoCalendar'
                    }).append('<p><strong>구분:</strong> ' + event.type + '</p>')
                    .append('<p><strong>시간:</strong> ' + getDisplayEventDate(event) + '</p>')
                    .append('<div class="popoverDescCalendar"><strong>설명:</strong> ' + event.description + '</div>'),
                  delay: {
                    show: "800",
                    hide: "50"
                  },
                  trigger: 'hover',
                  placement: 'top',
                  html: true,
                  container: 'body'
                });

                return filtering(event);

            },

            windowResize: function (event, ui) { // 브라우저 창의 크기가 변경되었을 때 달력을 다시 렌더링하도록 설정
                $('#calendar').fullCalendar('render');
            }
        });

    });



    // 일정에 hover시 나타나는 요약 중 시간을 나타냄
    function getDisplayEventDate(event) {
      var displayEventDate;

      if (event.allDay == false) {
        var startTimeEventInfo = moment(event.start).format('HH:mm');
        var endTimeEventInfo = moment(event.end).format('HH:mm');
        displayEventDate = startTimeEventInfo + " - " + endTimeEventInfo;
      } else {
        displayEventDate = "하루종일";
      }
      return displayEventDate;
    }

    function filtering(event) { // 달력 아래 필터부분
      var show_type = true;

      var types = $('#type_filter').val();

      if (types && types.length > 0) {
        if (types[0] == "all") {
          show_type = true;
        } else {
          show_type = types.indexOf(event.type) >= 0;
        }
      }

      return show_type;
    }

    function calDateWhenResize(event) {

      var newDates = {
        startDate: '',
        endDate: ''
      };

      if (event.allDay) {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = moment(event.end._d).subtract(1, 'days').format('YYYY-MM-DD');
      } else {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD HH:mm');
        newDates.endDate = moment(event.end._d).format('YYYY-MM-DD HH:mm');
      }

      return newDates;
    }

    function calDateWhenDragnDrop(event) {
      // 드랍시 수정된 날짜반영
      var newDates = {
        startDate: '',
        endDate: ''
      }

      // 날짜 & 시간이 모두 같은 경우
      if(!event.end) { // 종료날짜가 없다면
        event.end = event.start;
      }

      //하루짜리 all day
      if (event.allDay && event.end === event.start) { // 하루종일 & 종료날짜가 없는 경우
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = newDates.startDate;
      }

      //2일이상 all day
      else if (event.allDay && event.end !== null) { // 하루종일 & 종료날짜가 있는 경우
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = moment(event.end._d).subtract(1, 'days').format('YYYY-MM-DD');
        // 종료날짜는 종료날짜에서 1일을 뺀 값
      }

      //all day가 아님
      else if (!event.allDay) { // 하루종일이 아니라면
        newDates.startDate = moment(event.start).format('YYYY-MM-DD HH:mm');
        newDates.endDate = moment(event.end).format('YYYY-MM-DD HH:mm');
      }
      return newDates;
    }