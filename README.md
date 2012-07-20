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


## herokuのDaaSを使う

heroku上のアプリケーションにデータベースのアドオン[ClearDB MySQL Database](https://addons.heroku.com/cleardb)を追加して、DaaS（Database as a Service）としてローカルのnodeから利用する。

	$ heroku addon:add cleardb
	Adding cleardb to falling-galaxy-1006... done, v4 (free)
	Use `heroku addons:docs cleardb` to view documentation

	$ heroku addons
	=== falling-galaxy-1006 Configured Add-ons
	cleardb:ignite

	$ heroku config

`heroku config`を実行した際に`CLEARDB_DATABSE_URL`と表示されたものが、ClearDBへのDSN（データソース名）となっており、以下の構成をしている。

	mysql://{username}:{password}@{hostname}/{dbname}?reconnect=true

`mysqlshow`コマンドでローカルからClearDBに接続できることを確認する。

	$ mysqlshow -u {username} -p{password} -h {hostname} {dbname}
	Database: heroku_xxxxxxxxxxxxxxx
	+--------+
	| Tables |
	+--------+
	+--------+

まずテーブル定義と初期データを挿入するSQLスクリプト`test.sql`を作る。

*test.sql*

	CREATE TABLE IF NOT EXISTS table1
	(
		id INTEGER NOT NULL UNIQUE,
		name VARCHAR(50),
		age INTEGER
	);
	
	INSERT INTO table1 VALUES(1, 'Iron Man', 20);
	INSERT INTO table1 VALUES(2, 'Black Widow', 21);
	INSERT INTO table1 VALUES(3, 'Captain America', 22);

ClearDBに対してSQLスクリプトを実行する。

	$ mysql -u {username} -p{password} -h {hostname} {dbname} < test.sql

`table1`テーブルが作られたことを確認する。

	$ mysqlshow -u {username} -p{password} -h {hostname} {dbname}
	Database: heroku_xxxxxxxxxxxxxxx
	+--------+
	| Tables |
	+--------+
	| table1 |
	+--------+
	
	$ mysql -u {username} -p{password} -h {hostname} {dbname} -e 'SELECT * FROM table1'
	+----+-----------------+------+
	| id | name            | age  |
	+----+-----------------+------+
	|  1 | Iron Man        |   20 |
	|  2 | Black Widow     |   21 |
	|  3 | Captain America |   22 |
	+----+-----------------+------+


## nodeからClearDBを操作する

`mysql`モジュールを使って、nodeからheroku上のClearDBにアクセスしてみる。

まず`package.json`を編集して、`mysql`モジュールを`dependencies`に追加する。
**`node-mysql`の最新バージョンである2.0系は使わず、0.9系を明示的に指定する。**

*package.json*

	{
		"name": "jtpa-hackathon"
	  , "version": "0.0.1"
	  , "private": true
	  , "engines": {
		  "node": "0.8.x"
		, "npm": "1.1.x"
	  }
	  , "dependencies": {
		  "express": "2.5.11"
		, "ejs": ">= 0.0.1"
		, "mysql": ">= 0.9.5" // 追加
	  }
	}

編集が終わったら、`npm install`を実行して`mysql`モジュールをインストールする。

続いて、データベースを操作するコントローラを`routes/index.js`に実装していく。
はじめに`mysql`モジュールを使ったクライントをローカル変数として作成してDSNの設定を行う。

*routes/index.js*

	var mysql = require('mysql').createClient();
	mysql.host = 'us-cdbr-east.cleardb.com';
	mysql.user = 'xxxxxxxxxxxxxx';
	mysql.password = 'xxxxxxxx';
	mysql.database = 'heroku_xxxxxxxxxxxxxxx'

データベースからデータを取得するコントローラを追加して、`app.js`でルーティングする。

*routes/index.js*

	exports.db_select = function(req, res){
	  mysql.query('SELECT * FROM table1 WHERE id = ?', [req.params.id],
		function(err, result, fields) {
		  if(err) {
			res.send(500);
			throw err;
		  }

		  if(result.length) {
			var content = []
			  , record = result.shift();

			content.push('id: '+record.id);
			content.push('name: '+record.name);
			content.push('age: '+record.age);
			res.send(content.join('<br />'));
		  }
		  else {
			res.send(404);
		  }
		}
	  );
	};

*app.js*

	app.get('/set/:value', routes.set_session);
	app.get('/get', routes.get_session);
	app.get('/db_select/:id', routes.db_select); // 追加

ブラウザ、または`curl`コマンドで、<http://localhost:3000/db_select/1>にアクセスしてみる。
（ここまでの差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/4f1faff7992c7be98d4070f0b4afd450d80992d7)を参照）


次にデータベースにデータを挿入するコントローラを追加して、`app.js`でルーティングする。

*routes/index.js*

	exports.db_insert = function(req, res){
	  var id = req.query.id
		, name = req.query.name
		, age = req.query.age;

	  mysql.query('INSERT INTO table1 VALUES(?, ?, ?)', [id, name, age],
		function(err, result, fields) {
		  if(err) {
			res.send(500);
			throw err;
		  }

		  var content = []
		  content.push('id: '+id);
		  content.push('name: '+name);
		  content.push('age: '+age);
		  res.send('<h2>New record</h2>'+content.join('<br />'));
		}
	  );
	};

*app.js*

	app.get('/set/:value', routes.set_session);
	app.get('/get', routes.get_session);
	app.get('/db_select/:id', routes.db_select);
	app.get('/db_insert', routes.db_insert); // 追加

ブラウザ、または`curl`コマンドで、<http://localhost:3000/db_insert?id=4&name=Hulk&age=30>にアクセスしてみる。
（ここまでの差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/0b11d07d98e8a84b91d538b12fcdfaecad594588)を参照）

### おつかれさまでした

