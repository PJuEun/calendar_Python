# http://127.0.0.1:5000/show_calendar
import pymysql
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
db = pymysql.connect(host='localhost', port=3306, user='root', password='1234', db='calendar', charset='utf8')
cursor = db.cursor()

# 달력을 보여주는 화면
@app.route("/show_calendar", methods=["GET"])
def show_calendar():
    return render_template('show_calendar.html')


# GET : 데이터 보여주기
@app.route("/calendar", methods=["GET"])
def get_calendar():
    sql = "SELECT * FROM calendar"
    cursor.execute(sql)
    results = cursor.fetchall()
    result_dict = []

    for result in results:
        result_dict.append({
            "id": result[0],
            "title": result[1],
            "start": result[2],
            "end": result[3],
            "type": result[4],
            "color": result[5],
            "description": result[6],
            "allDay": result[7]
        })
    return jsonify(result_dict)

# POST : 데이터 집어넣기
@app.route("/calendar", methods=["POST"])
def save_calendar():
    data = request.get_json()
    title = data["title"]
    start = data["start"]
    end = data["end"]
    type = data["type"]
    color = data["color"]
    description = data["description"]
    allDay = data["allDay"]


    sql = f"INSERT INTO calendar (title, start, end, type, color, description, allDay) VALUES('{title}', '{start}', '{end}', '{type}', '{color}', '{description}', {allDay})"
    cursor.execute(sql)
    db.commit()
    return "OK"


# PUT : 데이터 수정하기
@app.route("/calendar", methods=["PUT"])
def update_calendar():
    data = request.get_json()
    calendar_id = data["id"]
    title = data["title"]
    start = data["start"]
    end = data["end"]
    type = data["type"]
    color = data["color"]
    description = data["description"]
    allDay = data["allDay"]

    sql = f"UPDATE calendar SET title = '{title}', start = '{start}', end = '{end}', type = '{type}', color = '{color}', description = '{description}', allDay = {allDay} WHERE id = {calendar_id}"
    cursor.execute(sql)
    db.commit()
    return "OK"

# PUT : 데이터 드래그해서 수정하기
@app.route("/calendar/stat", methods=["PUT"])
def drag_calendar():
    data = request.get_json()
    calendar_id = data["event_id"]  # 수정된 event_id를 사용
    start = data["start"]  # 수정된 시작 날짜 및 시간
    end = data["end"]  # 수정된 종료 날짜 및 시간

    sql = f"UPDATE calendar SET start = '{start}', end = '{end}' WHERE id = {calendar_id}"
    cursor.execute(sql)
    db.commit()
    return "OK"


# DELETE : 데이터 삭제하기
@app.route("/calendar", methods=["DELETE"])
def delete_calendar():
    data = request.get_json()
    id = data["id"]

    sql = f"DELETE FROM calendar WHERE id = {id}"
    cursor.execute(sql)
    db.commit()
    return "OK"


if __name__ == '__main__':
    app.run(debug=True, threaded=False)