# 2012年7月のJTPAギークサロン

[JTPAギークサロン「青木淳氏とNode.js/Herokuを体験する」](http://www.jtpa.org/event/000567.html)で使用したサンプルコードや環境設定手順などを掲載しておきます。


## 事前準備

node、npm、git、ssh、heroku、mysqlがローカル環境にインストールされていること（以下のコマンドでバージョンを確認）。

	$ node --version
	v0.8.2
	
	$ npm --version
	1.1.21
	
	$ git --version
	git version 1.7.5.4
	
	$ ssh -V
	OpenSSH_5.6p1, OpenSSL 0.9.8r 8 Feb 2011
	
	$ heruku --version
	heroku-gem/2.28.14 (x86_64-darwin11.2.0) ruby/1.9.2
	
	$ mysql --version
	mysql  Ver 14.14 Distrib 5.5.24, for osx10.7 (i386) using  EditLine wrapper

[heroku](http://www.heroku.com/)にサインアップ済みであり、[My Apps](https://api.heroku.com/myapps)ページにアクセスできること。また、[My Account](https://api.heroku.com/account)ページでBilling Infoが登録済みであること。


## expressを使ってnodeを動かしてみる

npmを使って[express](http://expressjs.com/)をインストールする。
**最新の3.0系はherokuでサポートされていないため2.5系を明示的に指定する。**

	$ npm -g install express@2.5
	$ express --version
	2.5.11

expressでアプリの枠組みを作る。

	$ express -s -t ejs jtpa-hackathon
	$ cd jtpa-hackathon
	$ npm install

ディレクトリ構成は以下のようになっている。

	jtpa-hackathon/
		|-- app.js
		|-- node_module/
		|-- package.json
		|-- public/
		|   |-- images/
		|   |-- javascripts/
		|   `-- stylesheets/
		|       `-- style.css
		|── routes/
		|   `-- index.js
		`-- views/
			`-- index.ejs

nodeを起動する。

	$ node app.js

ブラウザから<http://localhost:3000/>にアクセスすると、`Welcome to Express`というページが表示される。


## herokuにアプリをデプロイする

ターミナルからherokuにログインする。

	$ heroku login
	Enter your Heroku credentials.
	Email: account@yourdomain.com
	Password (typing will be hidden):
	Authentication successful.

heroku上に新しいアプリケーションを作成する。

	$ heroku create
	Creating falling-galaxy-1006... done, stack is cedar
	http://falling-galaxy-1006.herokuapp.com/ | git@heroku.com:falling-galaxy-1006.git
	Git remote heroku added

herokuの[My Apps](https://api.heroku.com/myapps)ページに新しいアプリケーションが追加されていることを確認する。
また、ブラウザから`http://<herokuアプリ名>.herokuapp.com`にアクセスして、`Heroku | Welcome to your new app!`のページが表示されることを確認する。

heroku上でブートストラップとなる`Procfile`を作る。

	$ echo 'web: node app.js' > Procfile

nodeの待受ポート番号の指定で`$PORT`環境変数を優先させるように`app.js`を修正する。
また、`package.json`でnodeのバージョンを明記する。
（差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/00b35ed2b3c335febe7cf0b72acf3631f8e5b3c3#app.js)を参照）


ローカルにgitリポジトリを作成する。

	$ pwd
	~/jtpa-hackathon  # カレントディレクトリを確認
	$ git init

`.gitignore`に`node_modules/`を追記する。

	$ echo 'node_modules/' >> .gitignore

ローカルのgitリポジトリに既存のファイルをコミットする。

	$ git add .
	$ git commit -m 'Initial commit'

ローカルのgitリポジトリにコミットしたファイルを、heroku上のgitリポジトリにプッシュする。

	$ git push heroku master
	（略）
	-----> Launching... done, v3
	       http://falling-galaxy-1006.herokuapp.com deployed to Heroku
	
	To git@heroku.com:falling-galaxy-1006.git
	* [new branch]      master -> master


ブラウザから`http://<herokuアプリ名>.herokuapp.com`にアクセスして、`Welcome to Express`のページが表示されることを確認する。


## ejsでビュースクリプトを書く

`views/index.ejs`や`views/layout.ejs`にHTMLを書き加えて、`Welcome to Express`のページがどう変化するかを見てみる。

*views/index.ejs*

	<h1><%= title %></h1>
	<p>Welcome to <%= title %></p>
	<p>Hello, JTPA!</p>

`views/layout.ejs`内の`<%- body %>`の部分に`views/index.ejs`の内容が組み込まれるようになっている。
ヘッダーやフッターなど各ページに共通する部分はレイアウトスクリプト（`views/layout.ejs`）に、リクエストによって動的に変わる部分はビュースクリプト（`views/index.ejs`）にコーディングする。
ビュースクリプト内では`<%= variable %>`と記述すると変数の内容が出力される。

次に、自前でビュースクリプトを作ってみる。
まずコントローラを`routes/index.js`に追加する。

*routes/index.js*

	exports.mytemplate = function(req, res) {
		res.render('mytemplate', {
			title: 'My Template'
		  , param1: req.params.p // URLから取得
		  , param2: 'hard coded'
		});
	};

`res.render()`の第1引数でビュースクリプトを指定し、第2引数に渡しているオブジェクトリテラルが、ビュースクリプト内で変数として参照可能となる。

続いて、`/mytemplate`へのリクエストを追加したコントローラにルーティングするコードを`app.js`に追加する。

*app.js*

	app.get('/', routes.index);
	app.get('/mytemplate/:p', routes.mytemplate); // 追加

`app.get()`の第1引数に含まれる`:p`は、URLの該当箇所にあるパラメータを保持するプレースホルダであり、`routes.mytemplate`内で`req.params.p`として参照されている。

最後にビュースクリプト`views/mytemplate.ejs`を作成する。

*views/mytemplate.ejs*

	<h1>Param1: <%= param1 %></h1>
	<h2>Param2: <%= param2 %></h2>


nodeを起動して、ブラウザから<http://localhost:3000/mytemplate/1>にアクセスしてみる。
（ここまでの差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/6c7a54f760b292410d7915cbf0692ad4b7977dda)を参照）


## JSONを返すAPIを作る

ビュースクリプトを使わず、データをJSONで返すようなAPIを作ってみる。

まずコントローラを`routes/index.js`に追加する。

*routes/index.js*

	exports.jsonapi = function(req, res) {
		var json = {
			name: 'obama'
		  , job: 'president'
		};
		res.send(json);
	};

`app.js`でルーティングする。

*app.js*

	app.get('/', routes.index);
	app.get('/mytemplate/:p', routes.mytemplate);
	app.get('/jsonapi', routes.jsonapi); // 追加

nodeを起動して、ターミナルから`curl`コマンドで<http://localhost:3000/jsonapi>にアクセスしてみる。

	$ curl -v http://localhost:3000/jsonapi
	> GET /jsonapi HTTP/1.1
	> User-Agent: curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5
	> Host: localhost:3000
	> Accept: */*
	>
	< HTTP/1.1 200 OK
	< X-Powered-By: Express
	< Content-Type: application/json; charset=utf-8
	< Content-Length: 34
	< Connection: keep-alive
	<
	{"name":"obama","job":"president"}

`res.send()`にオブジェクトリテラルを渡すと、nodeはContent-Typeヘッダを`application/json`にセットして、JSON形式でレスポンスボディを返すようになっている。

次に、クエリーストリングで指定されたパラメータをレスポンスに含めるようにAPIを改造する。

*routes/index.js*

	exports.jsonapi = function(req, res) {
		var json = {
			name: 'obama'
		  , job: 'president'
		  , salary: req.query.salary || 'unknown'
		};
		res.send(json);
	};

`curl`コマンドで<http://localhost:3000/jsonapi?salary=100>にアクセスすると、`{"name":"obama","job":"president","salary":"100"}`というJSONが返ってくる。
<http://localhost:3000/jsonapi>にアクセスすると、`{"name":"obama","job":"president","salary":"unknown"}`というJSONが返ってくる。
（ここまでの差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/cd5c8fd830e0ab81858dbb7c712fff9b1f782871)を参照）


## セッションを扱う

セッションはユーザーのログイン状態を追跡するためなどに使われる。
ここでは簡単なセッションへの保存、読取を行なってみる。

まずコントローラに2つのメソッドを追加する。

*routes/index.js*

	exports.set_session = function(req, res){
		req.session.value = req.params.value;
		res.send('value = '+req.params.value);
	};

	exports.get_session = function(req, res){
		res.send('session.value = '+req.session.value);
	}

`app.js`でルーティングする。

*app.js*

	app.get('/', routes.index);
	app.get('/mytemplate/:p', routes.mytemplate);
	app.get('/jsonapi', routes.jsonapi);
	app.get('/set/:value', routes.set_session); // 追加
	app.get('/get', routes.get_session); // 追加

ブラウザで<http://localhost:3000/get>にアクセスすると`session.value = undefined`と表示される。
続いて<http://localhost:3000/set/111>にアクセスすると`value = 111`と表示され、セッションに`111`という値が保存される。
再び<http://localhost:3000/get>にアクセスすると`session.value = 111`と表示される。
（ここまでの差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/d5a5c6343b9197c25d1f8f710b99febddfd9f4f3)を参照）

