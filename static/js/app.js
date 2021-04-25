//Elements
const options = document.querySelector('.option_things_to_read');
const junior_naver = document.querySelector('.junior_naver');
const apply_blue = document.querySelector('.apply_blue');
const apply_red = document.querySelector('.apply_red');
const apply_green = document.querySelector('.apply_green');
const naver_color = document.querySelector('.naver_color');
//==========main content elements================
const highlight_news = document.querySelector('.dynamic_news');
//==========option_thing_to_read=================
const option_things_to_read = document.querySelector('.option_things_to_read')

// Event Listeners
junior_naver.addEventListener("mouseover", apply_color_change);
junior_naver.addEventListener("mouseout", remove_color_change);
document.addEventListener('DOMContentLoaded', change_headLine_everyTwoSec);


// functions
function random_news_line() {
    const newsLineArr = [
        "제 26회 누가누가 이쁜 강아지일까 대회 우승견 '뽀미' "
    ,   "[속보] KOREA IT ACADEMY 융합서비스 개발자 양성과정A 전 인원 취업성공 "
    ,   "2021년 제 121회 노벨 교육상 '민진호' 강사님"
    ,   "코딩의 대부분 오류는 단순 오타에 의한 것으로 밝혀져 충격..."
    ,   "신림에 거주하는 김모씨 매일 습관성 야식 참느라 노력중으로 밝혀져..."
    ,   "현재 카페에서 코딩중인 김모씨 졸린것으로 추정..."
    ,   "켈리포니아주 주립병원 만병통치약 '치킨' 발명 성공"
    ]
    return newsLineArr;
}

function change_headLine_everyTwoSec() {
    let newsData = random_news_line();
    let i = 0;
    setInterval(function(){
        highlight_news.textContent=newsData[i];
        i++
        if(i >= newsData.length){
            i=0;
        }
    }, 2000);
}

//functions
function apply_color_change(){
    apply_blue.style.color = "blue";
    apply_red.style.color = "red";
    apply_green.style.color = "#2db400";
    naver_color.style.color="#2db400"
}

function remove_color_change(){
    apply_blue.style.color = "rgb(153,153,153)";
    apply_red.style.color = "rgb(153,153,153)";
    apply_green.style.color = "rgb(153,153,153)";
    naver_color.style.color="rgb(153,153,153)";
} 