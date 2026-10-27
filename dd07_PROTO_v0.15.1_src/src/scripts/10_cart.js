
/* ===== Cart (state only for now; Add wiring comes in step 6) ===== */
const Cart = {
  count: 0,
  render(){
    const btn = document.getElementById('cartBtn');
    document.getElementById('cartCount').textContent = this.count;
    btn.classList.toggle('is-filled', this.count > 0);
  }
};
Cart.render();

