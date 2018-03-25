
var db = connect("localhost/codeplus_production");

var cursor = db.contests.find();
while(cursor.hasNext()) {
    var contest = cursor.next();
    contest.contests = ['div1', 'div2'];
    contest.ranklist = {
        div1: contest.div1_ranklist,
        div2: contest.div2_ranklist
    };
    contest.contest_ids = {
        div1: contest.div1_contest_id,
        div2: contest.div2_contest_id,
        practise: contest.practise_contest_id
    }
    db.contests.save(contest);
}
