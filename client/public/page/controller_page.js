function carregar()
{
    const lista = document.getElementById("minhaLista");
const itens = ["Item 1", "Item 2", "Item 3"];

itens.forEach(item => {
  const li = document.createElement("li");
  li.textContent = item;
  lista.appendChild(li);
});
}