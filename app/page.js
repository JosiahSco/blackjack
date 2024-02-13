'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { initDeck } from "./deck";
import { useEffect, useState } from "react";

export default function Home() {
  let [playerHand, setPlayerHand] = useState([]);
  let [dealerHand, setDealerHand] = useState([]);
  let [betPlaced, setBetPlaced] = useState(false);
  let [bet, setBet] = useState(0);
  let [money, setMoney] = useState(100);

  let [stateMessage, setStateMessage] = useState('');

  // Should I simulate the deck or just be random? For now, I'll simulate the deck
  let [deck, setDeck] = useState(initDeck);

  useEffect(() => {
    dealInitialCards();
  }, []);

  const handlePlaceBet = (e) => {
    e.preventDefault();
    if (bet <= 0 || bet > money) {
      setStateMessage('Please enter a valid bet');
      return;
    }
    document.querySelector('input').disabled = true;
    document.querySelector('#placeBet').disabled = true;
    setBetPlaced(true);
  }

  const dealInitialCards = () => {
    let shuffledDeck = shuffleDeck(deck);

    let playerCards = [shuffledDeck.pop(), shuffledDeck.pop()];
    let dealerCards = [shuffledDeck.pop(), shuffledDeck.pop()];

    setDealerHand(dealerCards);
    setPlayerHand(playerCards);
    setDeck(shuffledDeck);
  }

  const handleHit = () => {
    // Make sure the player bet a valid amount
    if (bet <= 0 || bet > money) {
      setStateMessage('Please enter a valid bet');
      return;
    }
    // document.querySelector('input').disabled = true;

    // Handle player logic 
    let newPlayerCard = deck.pop();
    let newPlayerHand = [...playerHand, newPlayerCard];
    let playerTotal = calculateTotal(newPlayerHand);
    setPlayerHand(newPlayerHand);

    // Reset and return if player busts...pause
    if (playerTotal > 21) {
      setStateMessage('You busted! You lost ' + bet + ' dollars');
      setMoney(parseInt(money) - parseInt(bet));
      reset();
      return;
    }

    // Dealer's turn if player is still in
    if (calculateTotal(dealerHand) < 17) {
      setStateMessage('Dealer hit!');
      let newDealerCard = deck.pop();
      let newDealerHand = [...dealerHand, newDealerCard];
      setDealerHand(newDealerHand);

      // Dealer busts
      if (calculateTotal(newDealerHand) > 21) {
        setStateMessage('Dealer busted! You won ' + bet + ' dollars');
        setMoney(parseInt(money) + parseInt(bet));
        reset();
      }
    }


    setDeck(deck);
  }

  const handleStand = () => {
    // Make sure the player bet a valid amount
    if (bet <= 0 || bet > money) {
      setStateMessage('Please enter a valid bet');
      return;
    }
    // document.querySelector('input').disabled = true;

    // Dealer hits until 17 or bust
    let dealerTotal = calculateTotal(dealerHand);
    while (dealerTotal < 17) {
      setStateMessage('Dealer hit!');
      let newDealerCard = deck.pop();
      let newDealerHand = [...dealerHand, newDealerCard];
      dealerTotal = calculateTotal(newDealerHand);
      setDealerHand(newDealerHand);
    }

    // Dealer busts
    if (dealerTotal > 21) {
      setStateMessage('Dealer busted! You won ' + bet + ' dollars');
      setMoney(parseInt(money) + parseInt(bet));
      reset();
      return;
    }


    // Showdown
    // Compare player and dealer hands to determine the winner
    let playerTotal = calculateTotal(playerHand);
    if (playerTotal > dealerTotal) {
      setStateMessage('You won ' + bet + ' dollars');
      setMoney(parseInt(money) + parseInt(bet));
    } else if (playerTotal < dealerTotal) {
      setStateMessage('You lost ' + bet + ' dollars');
      setMoney(parseInt(money) - parseInt(bet));
    } else {
      setStateMessage('It\'s a push');
    }
    reset();
  }

  const reset = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setDeck(initDeck);
    dealInitialCards();
    setBetPlaced(false);
    document.querySelector('input').disabled = false;
    document.querySelector('#placeBet').disabled = false;
  }

  return (
    <main className={styles.main}>
      <h1>Blackjack</h1>
      <h2>{stateMessage}</h2>
      {betPlaced ? 
        <div className={styles.info}>
          <div className={styles.hand}>
            <h2>Dealer's Hand</h2>
            <p>{dealerHand.join(', ')}</p>
            <p>Total: {calculateTotal(dealerHand)}</p>
          </div>
          <hr className={styles.hr}/>
          <div className={styles.hand}>
            <h2>Your Hand</h2>
            <p>{playerHand.join(', ')}</p>
            <p>Total: {calculateTotal(playerHand)}</p>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.btn} onClick={handleHit}>Hit</button>
            <button className={styles.btn} onClick={handleStand}>Stand</button>
          </div> 
        </div>
        : null
      }
      <form onSubmit={handlePlaceBet}>
        <label>Bet </label>
        <input className={styles.input} type="number" value={bet} max={money} onChange={e => setBet(e.target.value)}></input>
        <button id="placeBet" >Place</button>
      </form>
        <h2>Money: {money}</h2>
    </main>
  );
}

function shuffleDeck(deck) {
  // This method (Schwartzian transform) is functional and less biased than using .sort with a random number
  return deck
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function calculateTotal(hand) {
  let total = 0;
  for (let card of hand) {
    let value = card.slice(0, -1);
    if (value === 'J' || value === 'Q' || value === 'K') {
      total += 10;
    } else if (value === 'A') {
      total += 11;
    } else {
      total += parseInt(value);
    }
  }
  return total;
}
