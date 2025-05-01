using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AspnetCoreMvcStarter.Utills
{
  public class TokenHelper
  {
    private readonly IConfiguration _configuration;

    public TokenHelper(IConfiguration configuration)
    {
      _configuration = configuration;
    }

    public string GenerateToken(string userId, string role)
    {
      var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
      var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
            {
                new Claim("UserId", userId),
                new Claim(ClaimTypes.Role, role)
            };

      var token = new JwtSecurityToken(
          issuer: _configuration["Jwt:Issuer"],
          audience: _configuration["Jwt:Issuer"],
          claims: claims,
          expires: DateTime.Now.AddDays(2),
          signingCredentials: credentials
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string authToken)
    {
      try
      {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateLifetime = true, 
          ValidateIssuerSigningKey = true,
          ValidIssuer = _configuration["Jwt:Issuer"],
          ValidAudience = _configuration["Jwt:Issuer"],
          IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]))
        };

        SecurityToken validatedToken;
        var principal = tokenHandler.ValidateToken(authToken, validationParameters, out validatedToken);

        return principal; 
      }
      catch (Exception)
      {
        return null;  
      }
    }

    public string GetUserId(string authToken)
    {
      var principal = ValidateToken(authToken);
      if (principal == null)
      {
        throw new SecurityTokenException("Invalid token");
      }

      var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "UserId");
      return userIdClaim?.Value ?? throw new SecurityTokenException("UserId claim not found");
    }
  }
}
