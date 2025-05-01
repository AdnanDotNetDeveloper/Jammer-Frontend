using AspnetCoreMvcStarter.Utills;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace JammerFrontend.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly TokenHelper _tokenHelper;

        public HomeController(IConfiguration configuration)
        {
            _configuration = configuration;
            _tokenHelper = new TokenHelper(_configuration);
        }

        private bool IsUserAuthenticated()
        {
            string? token = Request.Cookies["Token"];
            if (string.IsNullOrEmpty(token) || _tokenHelper.ValidateToken(token) == null)
            {
                Response.Cookies.Delete("Token");
                return false;
            }
            return true;
        }

        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Contact()
        {
            return View();
        }

        public IActionResult Cart()
        {
            if (!IsUserAuthenticated())
            {
                return Redirect("/Home/Login");
            }
            return View();
        }

        public IActionResult Wishlist()
        {
            if (!IsUserAuthenticated())
            {
                return Redirect("/Home/Login");
            }
            return View();
        }

        public IActionResult Account()
        {
            if (!IsUserAuthenticated())
            {
                return Redirect("/Home/Login");
            }
            return View();
        }

        public IActionResult Checkout()
        {
            if (!IsUserAuthenticated())
            {
                return Redirect("/Home/Login");
            }
            return View();
        }

        public IActionResult Product()
        {
            return View();
        }

        public IActionResult Signup()
        {
            return View();
        }

        public IActionResult Blog()
        {
            return View();
        }

        public IActionResult About()
        {
            return View();
        }

        public IActionResult Search()
        {
            return View();
        }

        public IActionResult Category()
        {
            return View();
        }

        public IActionResult Order()
        {
            return View();
        }
    }
}
