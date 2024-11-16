package game

import (
	"math/rand"
	"time"
)

type Game struct {
	Balance    uint
	Name       string
	Symbols    map[string]uint
	Multiplier map[string]uint
	Grid       [][]string
}

func NewGame() *Game {
	return &Game{
		Balance: 200,
		Symbols: map[string]uint{
			"A": 4,  // Lucky 7
			"B": 8,  // Cherry
			"C": 15, // Bell
			"D": 25, // Bar
		},
		Multiplier: map[string]uint{
			"A": 10, // Lucky 7 highest payout
			"B": 5,  // Cherry medium payout
			"C": 3,  // Bell lower payout
			"D": 2,  // Bar lowest payout
		},
		Grid: make([][]string, 3),
	}
}

func (g *Game) Spin(bet uint) (uint, [][]string) {
	if bet > g.Balance {
		return 0, g.Grid
	}

	g.Balance -= bet
	symbolArray := g.generateRandomSymbols()
	g.Grid = g.shuffleSymbols(symbolArray, 3, 3)
	winnings := g.calculateWinnings(bet)
	g.Balance += winnings

	return winnings, g.Grid
}

func (g *Game) generateRandomSymbols() []string {
	symbolArray := []string{}
	for symbol, count := range g.Symbols {
		for i := 0; i < int(count); i++ {
			symbolArray = append(symbolArray, symbol)
		}
	}
	return symbolArray
}

func (g *Game) shuffleSymbols(symbols []string, rows int, cols int) [][]string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	result := make([][]string, rows)
	for i := range result {
		result[i] = make([]string, cols)
	}

	for col := 0; col < cols; col++ {
		for row := 0; row < rows; row++ {
			randomIndex := r.Intn(len(symbols))
			result[row][col] = symbols[randomIndex]
		}
	}
	return result
}

func (g *Game) calculateWinnings(bet uint) uint {
	winnings := uint(0)

	// Check horizontal rows
	for _, row := range g.Grid {
		matched := true
		firstSymbol := row[0]
		for _, symbol := range row {
			if symbol != firstSymbol {
				matched = false
				break
			}
		}
		if matched {
			winnings += bet * g.Multiplier[firstSymbol]
		}
	}

	// Check vertical columns
	for col := 0; col < len(g.Grid[0]); col++ {
		matched := true
		firstSymbol := g.Grid[0][col]
		for row := 0; row < len(g.Grid); row++ {
			if g.Grid[row][col] != firstSymbol {
				matched = false
				break
			}
		}
		if matched {
			winnings += bet * g.Multiplier[firstSymbol]
		}
	}

	// Check diagonals
	if g.Grid[0][0] == g.Grid[1][1] && g.Grid[1][1] == g.Grid[2][2] {
		winnings += bet * g.Multiplier[g.Grid[0][0]]
	}
	if g.Grid[0][2] == g.Grid[1][1] && g.Grid[1][1] == g.Grid[2][0] {
		winnings += bet * g.Multiplier[g.Grid[0][2]]
	}

	return winnings
}
