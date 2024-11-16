package main

import (
	"encoding/json"
	"log"
	"net/http"
	"slotmachine/game"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type GameResponse struct {
	Grid     [][]string `json:"grid"`
	Balance  uint       `json:"balance"`
	Winnings uint       `json:"winnings"`
	Message  string     `json:"message"`
}

type BetRequest struct {
	Amount uint `json:"amount"`
}

var gameInstance *game.Game

func main() {
	gameInstance = game.NewGame()
	router := mux.NewRouter()

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
	})

	// Routes
	router.HandleFunc("/api/spin", handleSpin).Methods("POST")
	router.HandleFunc("/api/balance", handleGetBalance).Methods("GET")

	log.Println("Server starting on :8080...")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(router)))
}

func handleSpin(w http.ResponseWriter, r *http.Request) {
	var betRequest BetRequest
	if err := json.NewDecoder(r.Body).Decode(&betRequest); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if betRequest.Amount > gameInstance.Balance {
		http.Error(w, "Bet exceeds balance", http.StatusBadRequest)
		return
	}

	winnings, grid := gameInstance.Spin(betRequest.Amount)

	response := GameResponse{
		Grid:     grid,
		Balance:  gameInstance.Balance,
		Winnings: winnings,
		Message:  "",
	}

	if winnings > 0 {
		response.Message = "Congratulations! You won!"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleGetBalance(w http.ResponseWriter, r *http.Request) {
	response := map[string]uint{"balance": gameInstance.Balance}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
