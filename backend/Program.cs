using Dapper;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddHttpClient();

var app = builder.Build();
app.UseCors("AllowReactApp");

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Host=localhost;Database=feedback_db;Username=postgres;Password=postgres";
var telegramBotToken = builder.Configuration["Telegram:BotToken"];
var telegramChatId = builder.Configuration["Telegram:ChatId"];

app.MapGet("/api/managers", async () => {
    using var connection = new NpgsqlConnection(connectionString);
    var managers = await connection.QueryAsync<Manager>("SELECT id, name, photo_url as PhotoUrl FROM managers ORDER BY name");
    return Results.Ok(managers);
});

app.MapPost("/api/feedback", async (FeedbackRequest req, HttpClient httpClient) => {
    using var connection = new NpgsqlConnection(connectionString);
    var sql = @"INSERT INTO feedbacks (manager_id, rating, comment) VALUES (@ManagerId, @Rating, @Comment) RETURNING id";
    var id = await connection.ExecuteScalarAsync<int>(sql, req);

    if (req.Rating < 4 && !string.IsNullOrEmpty(telegramBotToken) && !string.IsNullOrEmpty(telegramChatId)) {
        var message = $"⚠️ Низкая оценка менеджеру!\nID менеджера: {req.ManagerId}\nОценка: {req.Rating}/5\nКомментарий: {req.Comment}";
        var telegramUrl = $"https://api.telegram.org/bot{telegramBotToken}/sendMessage?chat_id={telegramChatId}&text={Uri.EscapeDataString(message)}";
        try { await httpClient.GetAsync(telegramUrl); }
        catch (Exception ex) { Console.WriteLine($"Ошибка Telegram: {ex.Message}"); }
    }
    return Results.Ok(new { Success = true, FeedbackId = id });
});

app.Run("http://localhost:5000");

public class Manager {
    public int Id { get; set; }
    public string Name { get; set; }
    public string PhotoUrl { get; set; }
}
public class FeedbackRequest {
    public int ManagerId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
}
