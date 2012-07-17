# 2012年7月のJTPAギークサロン

[JTPAギークサロン「青木淳氏とNode.js/Herokuを体験する」](http://www.jtpa.org/event/000567.html)で使用したサンプルコードや環境設定手順などを掲載しておきます。


## 事前準備

node、npm、git、ssh、heroku、mysqlがローカル環境にインストールされていること（以下のコマンドでバージョンを確認）。
**nodeは最新の0.8系がherokuでサポートされていないため0.6系がインストールされていること。**

	$ node --version
	v0.6.18
	
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

ブラウザから<http://localhost:3000/>にアクセスしてみる。


## herokuにアプリをデプロイする

heroku上でブートストラップとなる`Procfile`を作る。

	$ echo 'web: node app.js' > Procfile

nodeの待受ポート番号の指定で`$PORT`環境変数を優先させるように`app.js`を修正する（差分は[こちら](https://github.com/bow-fujita/jtpa-july-2012/commit/00b35ed2b3c335febe7cf0b72acf3631f8e5b3c3#app.js)を参照）。

ローカルにgitリポジトリを作成する。

	$ pwd
	~/jtpa-hackathon  # カレントディレクトリを確認
	$ git init

`.gitignore`に`node_modules/`を追記する。

	$ echo 'node_modules/' >> .gitignore

ローカルのgitリポジトリに既存のファイルをコミットする。

	$ git add .
	$ git commit -m 'Initial commit'

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
ローカルのgitリポジトリにコミットしたファイルを、アプリケーション上のgitリポジトリにプッシュする。

	$ git push heroku master
	（略）
	-----> Launching... done, v3
	       http://falling-galaxy-1006.herokuapp.com deployed to Heroku
	
	To git@heroku.com:falling-galaxy-1006.git
	* [new branch]      master -> master


ブラウザから`http://<herokuアプリ名>.herokuapp.com`にアクセスしてみる。


