export async function getServerSideProps() {
  return { redirect: { destination: "/mayoreo/catalogo", permanent: false } };
}

export default function Mayoreo() {
  return null;
}
