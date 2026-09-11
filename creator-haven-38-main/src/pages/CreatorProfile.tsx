import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { MOCK_USERS, MOCK_PRODUCTS } from "@/data/mockData";

const CreatorProfile = () => {
  const { id } = useParams();
  const creator = MOCK_USERS.find((u) => u.id === id);
  const creatorProducts = MOCK_PRODUCTS.filter((p) => p.seller.id === id);

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-black text-4xl mb-4">Creator not found</h1>
            <Link to="/discover" className="brutal-btn bg-primary text-primary-foreground">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Profile Header */}
        <div className="brutal-card p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-24 h-24 rounded-full brutal-border brutal-shadow"
          />
          <div className="text-center sm:text-left">
            <h1 className="font-heading font-black text-3xl mb-2">{creator.name}</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg">{creator.bio}</p>
            <div className="flex gap-4 mt-3 justify-center sm:justify-start">
              <span className="text-sm font-bold">{creatorProducts.length} products</span>
              <span className="text-sm text-muted-foreground">
                Joined {new Date(creator.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="font-heading font-bold text-2xl mb-6">Products by {creator.name}</h2>
        {creatorProducts.length === 0 ? (
          <div className="brutal-card p-12 text-center">
            <p className="text-muted-foreground">No products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {creatorProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CreatorProfile;
