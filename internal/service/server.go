package service

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"time"
)

type HttpServer struct {
	DI       *DIContainer
	server   *http.Server
	listener net.Listener
	mux      *http.ServeMux
	Addr     string
}

func NewHttpServer(di *DIContainer) *HttpServer {
	return &HttpServer{
		DI:     di,
		server: &http.Server{},
	}
}

func (hs *HttpServer) CreateMutex() {
	mux := http.NewServeMux()

	publicPath := hs.DI.GetResourcePath().AssetsPath
	mux.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir(publicPath))))

	hs.mux = mux
	// httpServer.server = &http.Server{
	// 	Handler: mux,
	// }
}

func (hs *HttpServer) Start() string {

	hs.CreateMutex()

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("[HTTP] Failed to listen: %v", err)
	}
	hs.listener = ln
	hs.Addr = ln.Addr().String()

	hs.mux.HandleFunc("/api/data", func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"message": "Hello from Go!",
			"time":    time.Now().String(),
			"port":    hs.Addr,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	hs.server.Handler = hs.corsMiddleware(hs.mux)

	go func() {
		if err := hs.server.Serve(ln); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[HTTP] Serve error: %v", err)
		}
	}()
	log.Printf("[HTTP] server running at %s", hs.Addr)
	return hs.Addr
}

func (hs *HttpServer) Stop() {
	if hs.server == nil {
		return
	}
	if err := hs.server.Close(); err != nil {
		log.Printf("[HTTP] Close error: %v", err)
	}
	log.Println("[HTTP] server stopped")
}

func (hs *HttpServer) GetAddr() string {
	return hs.Addr
}

func (hs *HttpServer) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
