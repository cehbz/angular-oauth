package main

import (
	"encoding/json"
	"flag"
	"net/http"
	"strings"

	"code.google.com/p/go-uuid/uuid"
	"github.com/golang/glog"
)

var okRes = []byte(`"Ok"`)
var unauthRes = []byte(`"Unauthorized"`)

func unAuth(w http.ResponseWriter, req *http.Request) {
	glog.Info("unAuth")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write(unauthRes)
}

func basicAuth(w http.ResponseWriter, req *http.Request) {
	glog.Info("basicAuth")
	realm := "OAuth Demo (user, password)"
	user, pass, ok := req.BasicAuth()

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost")
	if !ok || user != "user" || pass != "password" {
		w.Header().Set("WWW-Authenticate", `Basic realm="`+realm+`"`)
		w.WriteHeader(http.StatusUnauthorized)
		w.Write(unauthRes)
		return
	}
	w.Write(okRes)
}

var token uuid.UUID

func getToken(w http.ResponseWriter, req *http.Request) {
	glog.Info("getToken")
	var cred struct {
		Username string
		Password string
	}
	d := json.NewDecoder(req.Body)
	if d == nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := d.Decode(&cred); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if cred.Username != "user" || cred.Password != "password" {
		glog.Infof("Bad credentials user: %s, pass: %s", cred.Username, cred.Password)
		w.WriteHeader(http.StatusUnauthorized)
		w.Write(unauthRes)
		return
	}
	token = uuid.NewUUID()
	b, err := json.Marshal(token.String())
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.Write(b)
}

func useToken(w http.ResponseWriter, req *http.Request) {
	glog.Info("useToken")
	ah := req.Header.Get("Authorization")
	if !strings.EqualFold(ah, "bearer "+token.String()) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write(unauthRes)
		return
	}
	w.Write(okRes)
}

func main() {
	flag.Parse()
	glog.Info("starting")
	http.HandleFunc("/unauth", unAuth)
	http.HandleFunc("/basic", basicAuth)
	http.HandleFunc("/gettoken", getToken)
	http.HandleFunc("/usetoken", useToken)
	http.Handle("/", http.FileServer(http.Dir("files")))
	glog.Fatal(http.ListenAndServe(":8888", nil))
}
