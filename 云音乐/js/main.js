$(function(){
  //ajax 获取数据
  /*const fetchData = (type,url)=>{
    return $.ajax({
    type: type,
    url: "https://api.imjad.cn/cloudmusic/?"+url,
    dataType: "json",
    success: function(data){
      console.log(JSON.stringify(data));
    },
    error:function(){
      alert("error");
    }
  })
  };*/
  //数据对象用于保存数据
  let data = {};
  //获取歌曲列表
  data.songsArr = [];
  data.songsId = [];//歌曲id
  data.songsName = [];//歌曲名字
  data.mvs = [];//mv列表 
  data.mvsId = [];//mv id
  
  //获取单曲列表数据
  const songsData =(input)=> getData("",{
    type: "search",
    s: input,
    search_type: 1,
  });
  //获取mv数据
  const getMvData = (input)=> getData('',{
    type: "search",
    s: input,
    search_type: 1004,
  })
  //修改播放资源
  const changeSrc = (id,src)=>{
    $(id).attr('src',src)
  }
  const getVideoSrc = (mvid)=>getData("",{
    type: "mv",
    id: mvid,
    br: 12800,//清晰度
  })
  
  //获取单曲列表并渲染
  const getSingleList = ()=>{
    songsData($(".input-search").val()).then(res=>{
      console.log(JSON.stringify(res));
      data.songsArr = res.result.songs;
      let singleList = ""; 
      data.songsArr.forEach((item)=>{
        //保存数据
        data.songsId.push(item.id);
        data.songsName.push(item.name);
        //data.songsSrc.push('https://');
        //渲染html字符串
        singleList += `<div class="single-left col-sm-9 col-xs-9">
        <h4 class="song-name">`; 
        singleList += item.name;
        singleList += `</h4>
        <span class="singer">-`;
        singleList += item.ar[0].name;
        singleList += `</span><span>`;
        singleList += `</span>
        </div>
        <div class="single-right col-sm-3  col-xs-3 ">
            <span class="glyphicon glyphicon-play "></span>
            <span class="glyphicon glyphicon-download"></span>
        </div>`;
        
      })
      //渲染列表
      $(".search-single").empty();
      $(".search-single").html(singleList);
      
    }).then(()=>{
      //点击播放按钮 显示播放器 更换audio src
      $(".single-right .glyphicon-play").on("click",function(e){
      console.log(e.target);
      $(".footer-player").show(500);
      let index = ($(this).parent().index()-1)/2;
      console.log("index"+index);
      changeSrc("#music-player","http://music.163.com/song/media/outer/url?id="+data.songsId[index]+".mp3");
      })
      
      $(".single-left").on("click",function(){
        $(".footer-player").show(500);
        changeSrc("#music-player","http://music.163.com/song/media/outer/url?id="+data.songsId[$(this).index()/2]+".mp3");
        console.log("index"+$(this).index());
      })
      //
      $(".audio-close").on("click",function(){
        $(".footer-player").hide(500);
      })
      $(".footer").on("mouseenter",function(){
        $(".footer-player").show(500);
      })
     
    })
  }
  //按下enter按钮请求单曲数据
  $("input").on("keyup",function(e){
    if(e.which==13){
      if(!$(".input-search").val()) 
      {alert("请输入内容！")
      return;}
      //列表数据初始化
      data.songsId = [];
      $(".search-single").html("<div class='loading'>get data loading。。。。。</div>");
      getSingleList();
      $(".search-single").show(500).siblings().hide();
    }
  })
  
  
 
  //点击‘单曲’按钮 显示列表 渲染列表
  $("#btn-single").on("click",function(){
    if(!$(".input-search").val()) return;
    $(".search-single").html("<div class='loading'>loading。。。。。。。。。。。。。。。。。。。。。。。。</div>")
    data.songsId = [];
    getSingleList();
    $(".search-single").show(500).siblings().hide();
    

  })
  //点击“视频”按钮切换view 请求数据
  $("#btn-video").on("click",function(){
    data.mvsId = [];
    $(".search-video-list").html("<div class='loading'>加载数据中。。。</div>");
    $(".search-video-list").slideDown(500).siblings().hide();
    if(!$(".input-search").val()){
      return;
    }
    //获取mv列表并渲染数据
    
    getMvData($(".input-search").val()).then((res)=>{
      console.log("res"+JSON.stringify(res));
      data.mvs = res.result.mvs;
      let mvsStr = "";
      data.mvs.forEach((item)=>{
        data.mvsId.push(item.id);
        mvsStr += `<div class="search-video col-sm-4">
        <div class="search-list-img ">
          <a href="javascript:">
            <img class="img-responsive" src="`;
        mvsStr += item.cover;
        mvsStr += `" alt="mv-image"></span>
        </a>
        <span class="view-time"><span class="glyphicon glyphicon-play">`
        if(item.playCount>100000)
        {
          mvsStr += parseInt(item.playCount/10000)+"万";
        }else{
          mvsStr += item.playCount;
        }
        
        mvsStr += `</span></span>
        </div>
        <div class="search-list-info ">
          <a href="javascript">
            <h4>`;
        mvsStr += item.name;
        mvsStr += `</h4>
        </a>
        <span class="small">`;
        if(item.briefDesc){
          console.log(item.briefDesc.length);
        } else{
          item.briefDesc = "";
        }
        mvsStr += item.briefDesc+"-"+item.artistName;
        mvsStr += `</span>
        </div>
      </div>`;
      });
      $(".search-video-list").empty();
      $(".search-video-list").html(mvsStr);
     
    }).then(()=>{
      //获取列表之后
      //点击播放列表
      $(".search-video").on("click",function(){
       let mvIndex = $(this).index();
       console.log(data.mvsId[mvIndex]);  
      //根据id获取播放资源url 渲染浏览器
      getVideoSrc(data.mvsId[mvIndex]).then((res)=>{
        let videoStr = "";
        videoStr += `"<video controls     
          class="col-sm-8 col-xs-12"
          src="`;
        //url..
        videoStr += res.data.brs[480];
        videoStr += `">
          sorry! 你的浏览器不支持video好可惜哦！
          </video>`;
        $(".video-modal").html(videoStr);
        
      })
      $(".cover").show();
       
      })//
      

    })
    //点击"关闭"按钮
    $(".video-close").on("click",function(){
      $("video").remove();
      $(".cover").hide(500);
    })
    
  });
  console.log("->->");
  
  
 
})