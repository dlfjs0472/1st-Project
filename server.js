var req = require('request');//설치
var static = require("serve-static");//정적자원 처리를 위한 외부모듈 (설치) 설치
var express = require('express');//설치
var http = require("http");
var fs = require("fs");
var ejs=require("ejs");
var mymodule=require("./lib/mymodule.js");
var path = require("path");//확장자 추출 등 파일경로와 관련된 처리 모듈
var mysql=require("mysql");
var app = express();
var multer = require("multer");//파일업로드 처리 모듈
var expressSession=require("express-session"); //서버측 세션을 관리하는 모듈

const client_id = '76nFPi1tyKHyTGDPh9hk';
const client_secret = 'sc5WXBnbKI';


app.use(static(__dirname+"/static")); //정적자원의 최상위 루트를 설정 
app.use(express.urlencoded({
    extended:true
}));//post 요청의 파라미터 받기위함

const conStr={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"1stproject"
};



/*===============================================
===================영화정보 요청처리===================
===============================================*/
app.get('/movie/list', function (request, response) {
  var keyword = request.query.keyword;
  
  var api_url = 'https://openapi.naver.com/v1/search/movie?query=' + encodeURI(keyword); // json 결과
  var options = {
      url: api_url,
      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
   };

    req.get(options, function (error, res, body) {
        if (!error && response.statusCode == 200) {
            response.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            response.end(body);
        }
    });
});


//세션 설정 
app.use(expressSession({
    secret:"key secret",
    resave:true,
    saveUninitialized:true
}));


//템플릿 뷰 엔진 등록 (서버 스크립트의 위치 등록)
app.set("view engine","ejs"); //등록 후엔 자동으로 무도건 views 라는 디렉토리 하위에서
//ejs를 찾아나선다.따라서 views라는 정해진 디렉토리를 무조건 존재시켜야 한다!!


/*===============================================
=================관리자모드 로그인 폼 요청=================
===============================================*/
app.get("/admin/loginform", function(request, response){
    response.render("admin/login");
});


/*===============================================
=================관리자 로그인 요청 처리 =================
===============================================*/
app.post("/admin/login", function(request, response){
    var master_id=request.body.master_id;
    var master_pass=request.body.master_pass;
    console.log(master_id);
    console.log(master_pass);

    var sql="select * from admin where master_id=? and master_pass=?";

    var con=mysql.createConnection(conStr);
    con.query(sql, [master_id, master_pass] , function(err,  result , fields){
        if(err){
            console.log("조회 실패", err);
        }else{
            if(result.length <1){
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgBack("로그인 정보가 올바르지 않습니다"));
            }else{
                request.session.admin={
                    admin_id: result[0].admin_id,
                    master_id:result[0].master_id,
                    master_pass:result[0].master_pass,
                    master_name:result[0].master_name
                };
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("로그인성공","/admin/main"));
            }
        }
        con.end();
    });
});

//관리자 모드 메인 요청 처리 
app.get("/admin/main", function(request, response){
    checkAdminSession(request, response, "admin/main");
});


/*---------------------------------------------------
세션 체크
---------------------------------------------------*/
function checkAdminSession(request, response, url){
    if(request.session.admin){ //  undefined가 아니라면..
        //인증 받은 관리자의 정보를 DB가 아닌 메모리 영역의 세션을 이용하여 가져오기 !!!    
        response.render(url, {
            adminUser:request.session.admin
        });
    }else{
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(mymodule.getMsgBack("관리자 인증이 필요한 서비스입니다."));
    }
}

/*===============================================
===================카페 영역=======================
===============================================*/


var upload = multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
            cb(null, __dirname+"/static/product");
        },
        filename:function(request, file, cb){
            cb(null, new Date().valueOf()+path.extname(file.originalname));
        }
    })    
});


app.use(express.urlencoded({extended:true})); //post방식 데이터 처리

//지정한 post 방식으로 클라이언트의 요청을 받음
app.post("/cafe/regist", upload.single("pic") , function(request, response){
    //1) 클라이언트가 전송한 파라미터들을 받자
    // console.log(request.body);
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var filename=request.file.filename;//multer를 이용했기 때문에 기존의 request객체에 추가된 것임!!
    console.log(title);
    console.log(filename);
    

 
    //2) mysql 접속
    var con=mysql.createConnection(conStr); //접속 후 Connection 객체 반환
 
    //3) 쿼리실행
    /*
    var sql="insert into cafe(title, writer, content)";
    sql+=" values('"+title+"','"+writer+"','"+content+"')";
    */
    //바인드 변수를 이용하면, 따옴표 문제를 고민하지 않아도 됨, 단 주의!
    //바인드 변수의 사용목적은 따옴표 때문이 아니라, DB 성능과 관련이있다 (java 시간에 자세히 할 예정)
    var sql="insert into cafe(title, writer, content, filename) values(?,?,?,?)";
 
    con.query(sql, [title, writer, content, filename], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("등록성공","/cafe/list"));
        }
        con.end();
    });
});


app.get("/cafe/list",function(request,response){

    //select 문 수행
    var con=mysql.createConnection(conStr);//접속 시도후 Connection 객체 반환
    con.query("select * from cafe order by cafe_id desc", function(err, result, fields){
        if(err){
            console.log(err); //에러 분석을 위해 콘솔 화면에 로그를 남김
       }else{
        //    console.log("result는 ", result);
        //    console.log("fields는 ", fields);
           fs.readFile("./views/cafe/cafe_list.ejs","utf8",function(err,data){
               response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
               //읽기만 하는게 아니라 서버에서 실행까지 해야하므로 render() 메서드를 이용하여 %%영역을
               //클라이언트에게 보내기 전에 서버측에서 먼저 실행을 해버리자
               response.end(ejs.render(data,{
                    cafeList:result,
                    lib:mymodule
               }));
           });
       }
       con.end(); //mysql 접속 끊기
    });
});


//상세보기 요청 처리
app.get("/cafe/detail", function(request, response){
    //get 방식으로 , 헤더를 통해 전송되어온 파라미터를 확인해보자
    // console.log(request.query);
    var cafe_id=request.query.cafe_id;
    // var sql="select * from cafe where cafe_id="+cafe_id;
    var sql="select * from cafe where cafe_id=?";
 
    var con=mysql.createConnection(conStr);
    con.query(sql, [cafe_id], function(err, result, fields){
        // console.log(result);
        if(err){
            console.log(err);
        }else{
            //디자인 보여주기 전에 조회수도 증가시키자
            con.query("update cafe set hit=hit+1 where cafe_id=?;", [cafe_id],function(er, fields){
                if(er){
                    console.log(er);
                }else{
                    fs.readFile("./views/cafe/cafe_detail.ejs", "utf8", function(error, data){
                        if(error){
                            console.log(error);
                        }else{
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(ejs.render(data,{
                                //result는 한건이라고 할지라도 배열이므로, 배열에서 꺼내서 보여주자
                                record:result[0]
                            }));
                        }
                    });
                }
                con.end(); //mysql 접속 끊기
            });
        }       
    });
});

//글 수정요청 처리
app.post("/cafe/edit", function(request, response){
    //파라미터 받기
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var cafe_id=request.body.cafe_id;
 
    //파라미터가 총 4개 필요
    var sql="update cafe set title=?, writer=?, content=? where cafe_id=?";
 
    var con=mysql.createConnection(conStr);
 
    con.query(sql, [title, writer, content, cafe_id], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("수정 성공","/cafe/detail?cafe_id="+cafe_id));
        }
        con.end();//mysql 연결 종류
    });
});



/*===============================================
===================쇼핑 영역=======================
===============================================*/

app.get("/shop/main", function(request ,response){
    //네비게이션의 카테고리 가져오기 
    var sql="select * from subcategory";

    var con=mysql.createConnection(conStr);
    con.query(sql, function(err, result, fields){
        if(err){
            console.log("하위 카테고리 가져오기 실패", err);
        }else{
            con.query("select * from product limit 0,4", function(error, record, fields){
                // limit 0,10 = 10건 가져오기
                if(error){
                    console.log("상품 가져오기 에러", error);
                }else{
                    response.render("shop/index", {
                        topList:result, 
                        productList:record    
                        // 반복문  
                    });            
                }
                con.end();
            });
        }
    });    
});


app.get("/admin/product/registform", function(request, response){
    var sql="select * from topcategory";
    
    var con = mysql.createConnection(conStr);
    con.query(sql, function(err, result, fields){
        if(err){
            console.log("상위 카테고리 조회 실패", err);
        }else{
            console.log(result);
            response.render("admin/product/regist", {
                record:result /*배열을 ejs에 전달*/
            });            
        }                 
        con.end();        
    });
});

app.get("/admin/product/sublist", function(request, response){
    
    var topcategory_id = request.query.topcategory_id; //파라미터 받기
    var sql="select * from subcategory where topcategory_id="+topcategory_id;

    //쿼리문 실행~~~~
    var con = mysql.createConnection(conStr);
    con.query(sql, function(err, result, fields){
        if(err){
            console.log("하위목록 가져오기 실패", err);
        }else{
            console.log("result is ", result);
            //어떤 페이지를 보여줘야 하나?
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(JSON.stringify(result));
        }
        con.end();
    });
});

app.post("/admin/product/regist", upload.single("product_img") ,function(request, response){
    //상품 정보 파라미터들 받기!!!
    //upload.single() 을 명시하면, multer 를 이용하여 파라미터를 받을 수 있게 된다..
    var subcategory_id=request.body.subcategory_id; 
    var product_name = request.body.product_name;
    var price=request.body.price;
    var brand=request.body.brand;
    var detail=request.body.detail;
    var filename=request.file.filename;

    var sql="insert into product(subcategory_id, product_name, price, brand, detail, filename)";    
    sql+=" values(?,?,?,?,?,?)";
    var con = mysql.createConnection(conStr);

    con.query(sql, [subcategory_id, 
        product_name, 
        price, 
        brand, 
        detail, 
        filename]  , function(err, fields){
            if(err){
                console.log("등록중 에러", err);
            }else{
                //클라이언트로 하여금 지정한 url로 재접속을 유도함
                response.redirect("/admin/product/list");
            }
            con.end();
    });    
});


app.get("/admin/product/list", function(request, response){
    var currentPage = 1; //기본적인 페이지 디폴트 값은 1로 한다..

    //누군가가 페이지 아래 링크를 눌렀다면,, currentPaget 파라미터가 넘어온다..
    if(request.query.currentPage!=undefined){
        currentPage=request.query.currentPage;
    }

    var sql="select product_id, s.subcategory_id, sub_name, product_name";
    sql+=", price, brand, filename";
    sql+=" from subcategory s,  product p";
    sql+=" where s.subcategory_id = p.subcategory_id";    

    var con=mysql.createConnection(conStr);

    con.query(sql, function(err, result, fields){
        if(err){
            console.log("상품 리스트 가져오기실패", err);
        }else{
            console.log(result);

            response.render("admin/product/list", {
                param:{
                    "currentPage":currentPage,
                    "record":result
                }
            });
        }
        con.end();
    });
});









app.get("/cafe/main", function(request, response){

    response.render("cafe/cafe_main", {});
});








































 app.listen(3000, function () {
   console.log('my server is running at 3000 port...');
 });