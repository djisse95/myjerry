Session.set("search",'');
Session.set("refine",'');
Session.set("rating",'');
// add categories
Template.addcategory.events({
	'click #btnAdd': function(e){
		e.preventDefault();
		var title = $('#title').val();
		var parent = $('#parent').val();
		var image = Session.get('img_categ');
		//alert(title+parent);
		Meteor.call("addCat", title, parent, image);
		Router.go("/managecategory");
	},
	'change #image': function(event, template) {
	//e.preventDefault();
    var files = event.target.files;
		for (var i = 0, ln = files.length; i < ln; i++) {
				images.insert(files[i], function (err, fileObj) {
				 //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
				Session.set('img_categ', fileObj._id);
			});
			//console.log(files[i]);
		}
		console.log('img uploaded!');
	}
});
Template.updatecategory.events({
	"click #btnUpdate": function(e) {
		//alert("Update");
		var id = $("#idRecord").val();
		var title = $('#title').val();
		var parent = $('#parent').val();
		var image = Session.get('img_categ');
		var attr={
			title:title,
			parent:parent,
			image:image
		};
		Meteor.call('updateCat',id, attr);
		Router.go('/manageCategory');   
	},
	'change #image': function(event, template) {
	//e.preventDefault();
    var files = event.target.files;
		for (var i = 0, ln = files.length; i < ln; i++) {
				images.insert(files[i], function (err, fileObj) {
				 //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
				Session.set('img_categ', fileObj._id);
			});
			//console.log(files[i]);
		}
		console.log('img uploaded!');
	}
});
Template.managecategory.events({
	'click #remove': function(e){
		e.preventDefault();
		var id = this._id;
		Meteor.call('deleteCategory', id);
		
	}
});
// helpers categories
Template.addcategory.helpers({
	getCategories: function(){	
		return categories.find();
	}	
});	
Template.updatecategory.helpers({
	getCat: function(cat){
		var cats = categories.findOne({_id:cat});
		Session.set('data',cats.title);
		return cats.title;
	},
	getCatall: function(){
		var catName = Session.get('data');
		return categories.find({title:{$ne:catName}});
	}
});	
Template.managecategory.helpers({
	manageCat: function(){
		var result = categories.find({});
		console.log(result);
		return result;
	},
	catName: function(cat){
		if(cat=='0')
			return;
		var result = categories.findOne({_id:cat});
		return result.title;
	}
});



Template.listing.helpers({
	parentTag: function(category){
		return parent_tags.find({"category_id":category});
	},
	tags: function(parent){
		return tags.find({parent:parent});
	},
	search: function(){
		return Session.get('search');
	},
	refine: function(){
		return Session.get('refine');
	},
	rating: function(){
		return Session.get('rating');
	}
	,
	filter: function(list,category, refine, rating){
		console.log('list:'+list);
		console.log('category:'+category);
		console.log('rating:'+rating);
		console.log("rating.length: "+rating.length);
		var ids=list.split(";");
		var result;
		console.log("Refine: "+refine);
		if( refine.length > 0 || rating!=""){
			var min = parseInt(refine[0]);
			var max = parseInt(refine[1]);
			console.log("Min: "+min+"  /  Max:"+max);
			//console.log(rating);
			
			console.log("refine.length: "+refine.length);

			if(rating !="" && refine.length <= 0){
				rating = parseInt(rating);
				result = products.find({"review.grade":rating,"category":category});
				console.log("size1:"+result.fetch().length);
			}	
			else if(refine.length > 0 && rating=="") {
				result = products.find({"price" : {$gte:min, $lte:max},"category":category});
				console.log("size2:"+result.fetch().length);
			}
			else{
				rating = parseInt(rating);
				result = products.find({"review.grade":rating,"price" : {$gte:min, $lte:max},"category":category});
				console.log("size3:"+result.fetch().length);
			}
				
		}
		//else if( refine.length > 0 )
		else{
			if(list ==""){
				result= products.find({"category":category});
				console.log("size4:"+result.fetch().length);
			}else{
				result= products.find({"tags":{$in: ids},"category":category});
				console.log("size5:"+result.fetch().length);
			}
			
			
		}
			
	
		//console.log(result.fetch()[0]);
		return result;
	}
});

Template.updatecategory.onRendered(function(){

	Session.set('img_categ',this.data.image);
	
});

Template.addcategory.onRendered(function(){

	Session.set('img_categ','');
	
});

Template.listing.events({
	'click .tag': function(e){
		var id=this._id+";";
		var position=Session.get('search').indexOf(id);
		console.log(position);
		if(position<0){
			var newVal=Session.get('search')+this._id+";";
			Session.set('search',newVal);
		}else{
			var newVal=Session.get('search').replace(this._id+";","");
			Session.set('search',newVal);
		}
		console.log("Search:"+Session.get('search'));
		
	},
	'click #favorite':function(e){
        
        
             e.preventDefault();
             var id=this._id;
             console.log('id'+Session.get('userId'));
             if(Session.get('userId')){
                 //alert();
                 var obj={
                    proId:id,
                    userId:Session.get('userId')
                 }

                 Meteor.call('insertFavorite',obj);
                  alert('Product successfully append to favorite!');
            }
            else{
            	var newId=Random.id();
                Session.setPersistent('userId',newId);
                 //var ses=Session.get('userId');
                 
                 var obj={
                    proId:id,
                    userId:Session.get('userId')
                 }

                 Meteor.call('insertFavorite',obj);
                 alert('Product successfully added to favorite!');
            }
    }
});

Template.listing.onRendered(function () {
  // Use the Packery jQuery plugin
  $('#myJourney').modal('show');
});